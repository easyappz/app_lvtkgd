from django.contrib import admin

from .models import Member, Post, Comment, Friendship, Chat, Message

admin.site.register(Member)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Friendship)
admin.site.register(Chat)
admin.site.register(Message)