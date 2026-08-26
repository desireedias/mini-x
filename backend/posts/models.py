from django.db import models
from django.conf import settings


# Create your models here.
class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )

    content = models.TextField(max_length=280)
    media = models.ImageField(upload_to='posts_media/', null=True, blank=True)

    #autoreferencia para respostas
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    #sistema de likes M2M
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='liked_posts',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        prefix = f"Reply to #{self.parent.id}" if self.parent else "Post"
        return f"{prefix} by @{self.author.username}: {self.content[:30]}"
