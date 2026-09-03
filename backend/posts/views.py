from django.db import connection
from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .permissions import IsAuthorOrReadOnly
from .models import Post
from .serializers import PostSerializer


from django.db.models import Q
from rest_framework import generics, permissions

class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    # 1. Exige autenticação obrigatória para que request.user nunca venha como AnonymousUser no Feed
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Post.objects.filter(parent__isnull=True).select_related('author')
        user = self.request.user
        user_id = str(user.id)

        # 2. Busca os IDs de quem o usuário logado segue via SQL direto
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT to_user_id FROM users_user_following WHERE from_user_id = %s",
                [user_id]
            )
            following_ids = [row[0] for row in cursor.fetchall()]

        # 3. Adiciona o próprio usuário à lista de permissão de visualização
        allowed_ids = following_ids + [user_id]

        # 4. Filtra garantindo que só os autores seguidos (ou o próprio usuário) retornem
        return queryset.filter(author__id__in=allowed_ids)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.filter(parent__isnull=True).select_related('author')
        user = self.request.user

        if user.is_authenticated:
            # Busca os IDs de quem o usuário atual segue
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT to_user_id FROM users_user_following WHERE from_user_id = %s",
                    [str(user.id)]
                )
                following_ids = [row[0] for row in cursor.fetchall()]

            # Inclui o ID do próprio usuário no filtro
            following_ids.append(str(user.id))

            # Filtra os posts apenas dessa lista de usuários
            return queryset.filter(author_id__in=following_ids)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        replies = instance.replies.all().select_related('author')
        replies_serializer = self.get_serializer(replies, many=True, context={'request': request})

        data = serializer.data
        data['replies'] = replies_serializer.data
        return Response(data)


class PostLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user

        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({
            "is_liked": liked,
            "likes_count": post.likes.count()
        },status=status.HTTP_200_OK)