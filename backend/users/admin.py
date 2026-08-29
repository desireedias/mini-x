from django.contrib import admin
from .models import User

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'name', 'email', 'created_at')
    search_fields = ('username', 'name', 'email')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'name', 'bio', 'avatar', 'banner')}),
    )