from django.db import connection
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from django.db.models import Q

from posts.serializers import PostSerializer
from .serializers import UserRegisterSerializer, UserProfileSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_posts = user.posts.filter(parent__isnull=True).order_by("-created_at")

        data = UserProfileSerializer(user).data
        data["posts"] = PostSerializer(user_posts, many=True).data
        return Response(data)

    def patch(self, request):
        user = request.user

        if "password" in request.data and request.data["password"]:
            user.set_password(request.data["password"])
            request.data.pop("password")

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            # 1. Busca o usuário do perfil pelo username ou ID
            target_user = User.objects.get(Q(id=username) | Q(username=username))
            user_posts = target_user.posts.filter(parent__isnull=True).order_by("-created_at")

            # 2. Converte o modelo para dicionário Python mutável
            data = UserProfileSerializer(target_user).data
            data["posts"] = PostSerializer(user_posts, many=True).data

            # 3. Verifica no SQL se o usuário logado segue este perfil
            is_following = False
            if request.user and request.user.is_authenticated:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT 1 FROM users_user_following WHERE from_user_id = %s AND to_user_id = %s",
                        [str(request.user.id), str(target_user.id)]
                    )
                    if cursor.fetchone():
                        is_following = True

            # 4. Busca os contadores
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT COUNT(*) FROM users_user_following WHERE to_user_id = %s",
                    [str(target_user.id)]
                )
                followers_count = cursor.fetchone()[0]

                cursor.execute(
                    "SELECT COUNT(*) FROM users_user_following WHERE from_user_id = %s",
                    [str(target_user.id)]
                )
                following_count = cursor.fetchone()[0]

            # 5. INJETA AS CHAVES EXPLICITAMENTE NO DICIONÁRIO
            data["is_following"] = is_following
            data["followers_count"] = followers_count
            data["following_count"] = following_count

            return Response(data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            # 1. Busca o usuário do perfil (seja por username ou ID)
            target_user = User.objects.get(Q(id=username) | Q(username=username))
            user_posts = target_user.posts.filter(parent__isnull=True).order_by("-created_at")

            data = UserProfileSerializer(target_user).data
            data["posts"] = PostSerializer(user_posts, many=True).data

            # --- LOGS DE DEBUG NO TERMINAL DO DJANGO ---
            auth_header = request.headers.get('Authorization')
            print("\n" + "="*50)
            print(f"DEBUG PROFILE GET -> Header Authorization: {auth_header}")
            print(f"DEBUG PROFILE GET -> User autenticado?: {request.user.is_authenticated}")
            print(f"DEBUG PROFILE GET -> User logado ID: {getattr(request.user, 'id', None)}")
            print(f"DEBUG PROFILE GET -> Target User ID: {target_user.id}")

            # 2. Verifica se o usuário logado já segue este perfil
            is_following = False
            if request.user and request.user.is_authenticated:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT 1 FROM users_user_following WHERE from_user_id = %s AND to_user_id = %s",
                        [str(request.user.id), str(target_user.id)]
                    )
                    if cursor.fetchone():
                        is_following = True

            # 3. Calcula as contagens de seguidores e seguidos
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT COUNT(*) FROM users_user_following WHERE to_user_id = %s",
                    [str(target_user.id)]
                )
                followers_count = cursor.fetchone()[0]

                cursor.execute(
                    "SELECT COUNT(*) FROM users_user_following WHERE from_user_id = %s",
                    [str(target_user.id)]
                )
                following_count = cursor.fetchone()[0]

            # 4. Injeta os dados adicionais na resposta JSON
            data["is_following"] = is_following
            data["followers_count"] = followers_count
            data["following_count"] = following_count

            return Response(data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            user_posts = user.posts.filter(parent__isnull=True).order_by("-created_at")

            data = UserProfileSerializer(user).data
            data["posts"] = PostSerializer(user_posts, many=True).data
            return Response(data)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )


class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(Q(id=username) | Q(username=username))
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.id == target_user.id:
            return Response({"error": "Você não pode seguir a si mesmo."}, status=status.HTTP_400_BAD_REQUEST)

        user_id = str(request.user.id)
        target_id = str(target_user.id)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM users_user_following WHERE from_user_id = %s AND to_user_id = %s",
                [user_id, target_id]
            )
            already_following = cursor.fetchone()

            if already_following:
                cursor.execute(
                    "DELETE FROM users_user_following WHERE from_user_id = %s AND to_user_id = %s",
                    [user_id, target_id]
                )
                following = False
            else:
                cursor.execute(
                    "INSERT INTO users_user_following (from_user_id, to_user_id) VALUES (%s, %s)",
                    [user_id, target_id]
                )
                following = True

            cursor.execute(
                "SELECT COUNT(*) FROM users_user_following WHERE to_user_id = %s",
                [target_id]
            )
            followers_count = cursor.fetchone()[0]

        return Response({"following": following, "followers_count": followers_count}, status=status.HTTP_200_OK)

class SuggestUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        following_ids = []

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT to_user_id FROM users_user_following WHERE from_user_id = %s",
                    [str(user.id)]
                )
                following_ids = [str(row[0]) for row in cursor.fetchall()]
        except Exception as e:
            following_ids = []

        suggested_users = User.objects.exclude(id=str(user.id)).exclude(id__in=following_ids)[:5]

        if not suggested_users.exists():
            suggested_users = User.objects.exclude(id=str(user.id))[:5]

        serializer = UserProfileSerializer(suggested_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserFollowersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT from_user_id FROM users_user_following WHERE to_user_id = %s",
                [str(target_user.id)]
            )
            follower_ids = [row[0] for row in cursor.fetchall()]

        followers = User.objects.filter(id__in=follower_ids)
        serializer = UserProfileSerializer(followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserFollowingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT to_user_id FROM users_user_following WHERE from_user_id = %s",
                [str(target_user.id)]
            )
            following_ids = [row[0] for row in cursor.fetchall()]

        following = User.objects.filter(id__in=following_ids)
        serializer = UserProfileSerializer(following, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)