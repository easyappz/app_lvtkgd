from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListCreateAPIView, ListAPIView, RetrieveUpdateAPIView, UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max, Prefetch
from django.utils import timezone

from .models import *
from .serializers import *
from .pagination import CustomPagination


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()
        return Response(
            MemberSerializer(member).data,
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password'],
            )
            if user:
                login(request, user)
                return Response({"message": "Logged in successfully"})
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(RetrieveAPIView):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PostsListCreateView(ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        friends_q = (
            Q(author__friendships__status=Friendship.STATUS_ACCEPTED, author__friendships__from_member=self.request.user) |
            Q(author__friendships__status=Friendship.STATUS_ACCEPTED, author__friendships__to_member=self.request.user)
        )
        return Post.objects.filter(friends_q | Q(author=self.request.user)).prefetch_related('author').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Post.objects.prefetch_related('author')


class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        post = get_object_or_404(Post, id=id)
        like, created = Like.objects.get_or_create(member=request.user, post=post)
        if not created:
            like.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostCommentView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['id'])
        serializer.save(post=post, author=self.request.user)


class ProfileView(RetrieveUpdateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    queryset = Member.objects.all()
    lookup_field = 'username'

    def get_object(self):
        obj = get_object_or_404(self.queryset, username=self.kwargs[self.lookup_field])
        if self.request.method in ['PATCH', 'PUT']:
            if not self.request.user.is_authenticated or self.request.user != obj:
                raise PermissionDenied('Can only update own profile.')
        return obj


class FriendsView(APIView):

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, username):
        member = get_object_or_404(Member, username=username)
        friends_q = (
            Q(friendships__status=Friendship.STATUS_ACCEPTED, friendships__from_member=member) |
            Q(friendships__status=Friendship.STATUS_ACCEPTED, friendships__to_member=member)
        )
        friends_qs = Member.objects.filter(friends_q).distinct().order_by('username')
        paginator = CustomPagination()
        page = paginator.paginate_queryset(friends_qs, request)
        if page is None:
            return paginator.get_paginated_response([])
        serializer = MemberSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, username):
        target_username = request.data.get('target_username')
        if not target_username:
            return Response({'error': 'target_username required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target = Member.objects.get(username=target_username)
        except Member.DoesNotExist:
            return Response({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
        if target == request.user:
            return Response({'error': 'Cannot send friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        friendship_filter = Friendship.objects.filter(from_member=request.user, to_member=target)
        if friendship_filter.filter(status=Friendship.STATUS_ACCEPTED).exists():
            return Response({'error': 'Already friends'}, status=status.HTTP_409_CONFLICT)
        if friendship_filter.exists():
            return Response({'error': 'Friend request already sent'}, status=status.HTTP_409_CONFLICT)
        Friendship.objects.create(from_member=request.user, to_member=target)
        return Response({'message': 'Friend request sent'}, status=status.HTTP_201_CREATED)


class AcceptFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username, request_id):
        friendship = get_object_or_404(
            Friendship,
            id=request_id,
            to_member__username=username,
            status=Friendship.STATUS_PENDING
        )
        if friendship.to_member != request.user:
            raise PermissionDenied('Can only accept your own requests.')
        friendship.status = Friendship.STATUS_ACCEPTED
        friendship.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, username, friend_username):
        member = get_object_or_404(Member, username=username)
        if member != request.user:
            raise PermissionDenied('Can only remove your own friends.')
        friend = get_object_or_404(Member, username=friend_username)
        Friendship.objects.filter(
            Q(from_member=member, to_member=friend) |
            Q(from_member=friend, to_member=member)
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessagesChatsView(ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return self.request.user.chats.annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')


class ChatMessagesView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        return Message.objects.filter(
            chat_id=chat_id,
            chat__members=self.request.user
        ).order_by('created_at')


class SendMessageView(CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        chat = get_object_or_404(Chat, id=self.kwargs['chat_id'], members=self.request.user)
        serializer.save(chat=chat, author=self.request.user)


class UpdateLastSeenView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Member.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance != request.user:
            raise PermissionDenied('Can only update own last seen.')
        instance.last_seen = timezone.now()
        instance.save(update_fields=['last_seen'])
        return Response(status=status.HTTP_204_NO_CONTENT)
