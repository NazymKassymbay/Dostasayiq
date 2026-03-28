from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post, Category, PostLike
from .serializers import PostSerializer, CategorySerializer, PostSearchSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def post_list(request):
    s = PostSearchSerializer(data=request.query_params)
    s.is_valid()
    d = s.validated_data
    posts = Post.objects.filter(is_active=True).select_related('author', 'author__profile', 'category')
    if d.get('q'):
        posts = posts.filter(Q(title__icontains=d['q']) | Q(description__icontains=d['q']) | Q(stack__icontains=d['q']))
    if d.get('city'):
        posts = posts.filter(city__icontains=d['city'])
    if d.get('category'):
        posts = posts.filter(category_id=d['category'])
    if d.get('sphere'):
        posts = posts.filter(sphere=d['sphere'])
    if d.get('experience'):
        posts = posts.filter(experience_required=d['experience'])
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_create(request):
    serializer = PostSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Post.objects.select_related('author', 'author__profile', 'category').get(pk=pk)
        except Post.DoesNotExist:
            return None

    def get(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        return Response(PostSerializer(post, context={'request': request}).data)

    def put(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        if post.author != request.user:
            return Response({'error': 'Forbidden'}, status=403)
        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        if post.author != request.user:
            return Response({'error': 'Forbidden'}, status=403)
        post.delete()
        return Response(status=204)


class MyPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).select_related('author', 'author__profile', 'category')
        return Response(PostSerializer(posts, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    like, created = PostLike.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        post.likes_count = max(0, post.likes_count - 1)
        post.save()
        return Response({'liked': False, 'likes_count': post.likes_count})
    post.likes_count += 1
    post.save()
    return Response({'liked': True, 'likes_count': post.likes_count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_posts(request):
    """Simple matching: find posts based on user's skills and city"""
    user = request.user
    profile = getattr(user, 'profile', None)
    user_skills = (profile.skills or '').lower().split(',') if profile else []
    user_city = (profile.city or '').lower() if profile else ''
    user_exp = (profile.experience_level or '') if profile else ''

    posts = Post.objects.filter(is_active=True).exclude(author=user).select_related('author', 'author__profile', 'category')

    scored = []
    for post in posts:
        score = 0
        # city match
        if user_city and post.city.lower() == user_city:
            score += 3
        # experience match
        if user_exp and (post.experience_required == user_exp or post.experience_required == 'any'):
            score += 2
        # skills/stack overlap
        post_stack = post.stack.lower()
        for skill in user_skills:
            skill = skill.strip()
            if skill and skill in post_stack:
                score += 2
        scored.append((score, post))

    scored.sort(key=lambda x: -x[0])
    top_posts = [p for _, p in scored[:10]]
    return Response(PostSerializer(top_posts, many=True, context={'request': request}).data)
