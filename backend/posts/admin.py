from django.contrib import admin
from .models import Post


# Register your models here.
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'parent', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username')

    def content_preview(self, obj):
        return obj.content[:50]
 