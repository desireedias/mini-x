
from datetime import datetime, timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

class BetterAuthAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        print(">>> HEADER RECEBIDO NO DJANGO:", auth_header)
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        if not token or token == 'null' or token == 'undefined':
            return None

        with connection.cursor() as cursor:
            cursor.execute(
                'SELECT "userId", "expiresAt" FROM "session" WHERE "token" = %s',
                [token]
            )
            row = cursor.fetchone()

        if not row:
            raise AuthenticationFailed('Sessão do Better Auth inválida ou não encontrada.')

        user_id, expires_at = row

        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at and expires_at < datetime.now(timezone.utc):
            raise AuthenticationFailed('Sessão expirada.')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('Usuário não encontrado.')

        return (user, None)