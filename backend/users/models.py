from django.db import models
from django.contrib.auth.models import AbstractBaseUser

class User(AbstractBaseUser):
    id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    

    password = models.CharField(max_length=255)

    last_login = None
    password = None
    
    bio = models.TextField(max_length=160, blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)
    banner = models.CharField(max_length=500, blank=True, null=True)

    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True,
        db_table='users_user_following',
    )

    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'name']

  
    is_active = True
    is_staff = False

    class Meta:
        db_table = 'user'
        managed = False

    def __str__(self):
        return f"@{self.username}"