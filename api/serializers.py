from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.db.models import Q

from .models import Member, Post, Comment, Friendship, Chat, Message

class MinimalMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'avatar']

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'avatar', 'last_seen']
        read_only_fields = ['id', 'last_seen']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class ProfileSerializer(MemberSerializer):
    friends_count = serializers.SerializerMethodField()

    def get_friends_count(self, obj):
        return Friendship.objects.filter(
            status=Friendship.STATUS_ACCEPTED,
            Q(from_member=obj) | Q(to_member=obj)
        ).count()

class PostSerializer(serializers.ModelSerializer):
    author = MemberSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'content', 'media_urls', 'author', 'likes_count', 'comments_count', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    author = MinimalMemberSerializer(read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    parent_id = serializers.IntegerField(source='parent.id', read_only=True, allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'post_id', 'parent_id', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    def get_last_message(self, obj):
        message = obj.messages.last()
        if message:
            return {
                'id': message.id,
                'text': message.text,
                'timestamp': message.created_at.isoformat(),
                'author': {
                    'id': message.author.id,
                    'username': message.author.username,
                    'avatar': message.author.avatar,
                }
            }
        return None

    class Meta:
        model = Chat
        fields = ['id', 'members', 'last_message']

class MessageSerializer(serializers.ModelSerializer):
    author = MinimalMemberSerializer(read_only=True)
    chat_id = serializers.IntegerField(source='chat.id', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at')

    class Meta:
        model = Message
        fields = ['id', 'chat_id', 'author', 'text', 'timestamp']

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'from_member', 'to_member', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']