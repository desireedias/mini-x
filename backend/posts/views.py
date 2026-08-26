from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Post
from .serializers import PostSerializer


# Create your views here.
#GET lista posts principais (Feed) | POST: cria post ou reposta
class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        #traz apenas os posts principais no feed(onde parent é nulo)
        return Post.objects.filter(parent__isnull=True).select_related('author')

    def perform_create(self, serializer):
        #associa automaticamente o usuario logado ao autor
        serializer.save(author=self.request.user)


#GET: detalha post especifico e traz a lista de suas respostas
class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        #serializa as respostas associadas a este post
        replies = instance.replies.all().select_related('author')
        replies_serializer = self.get_serializer(replies, many=True)

        data = serializer.data
        data['replies'] = replies_serializer.data
        return Response(data)

#POST: toogle do like (adiciona se curtiu, remove se já curtiu)

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