from django.contrib.auth.backends import BaseBackend

from .models import Member


class MemberBackend(BaseBackend):
    """
    Custom authentication backend for Member model.
    """

    def authenticate(self, request, **credentials):
        username = credentials.get('username')
        password = credentials.get('password')

        if username is None or password is None:
            return None

        try:
            member = Member.objects.get(username=username)
            if member.is_active and member.check_password(password):
                return member
        except Member.DoesNotExist:
            # Protect against timing attacks
            Member().check_password(password)

        return None

    def get_user(self, user_id):
        try:
            return Member.objects.get(pk=user_id)
        except Member.DoesNotExist:
            return None
