from rest_framework import serializers
from .models import Post, Category, PostLike


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    category_icon = serializers.ReadOnlyField(source='category.icon')
    category_color = serializers.ReadOnlyField(source='category.color')
    is_liked = serializers.SerializerMethodField()
    author_avatar_color = serializers.ReadOnlyField(source='author.profile.avatar_color')
    author_bio = serializers.ReadOnlyField(source='author.profile.bio')
    author_experience = serializers.ReadOnlyField(source='author.profile.experience_level')

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'stack', 'level', 'sphere',
                  'city', 'preferred_time', 'experience_required', 'is_active',
                  'author', 'author_username', 'author_avatar_color', 'author_bio',
                  'author_experience', 'category', 'category_name', 'category_icon',
                  'category_color', 'likes_count', 'is_liked', 'created_at']
        read_only_fields = ['author', 'created_at', 'likes_count']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(user=request.user, post=obj).exists()
        return False


class PostSearchSerializer(serializers.Serializer):
    q = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    sphere = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
