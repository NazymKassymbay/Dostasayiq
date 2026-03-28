from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='📁')
    color = models.CharField(max_length=20, default='#6366f1')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class Post(models.Model):
    LEVEL_CHOICES = [('idea', 'Idea'), ('mvp', 'MVP'), ('startup', 'Startup')]
    SPHERE_CHOICES = [
        ('fintech', 'Fintech'), ('edtech', 'EdTech'), ('gamedev', 'GameDev'),
        ('healthcare', 'Healthcare'), ('ecommerce', 'E-Commerce'), ('social', 'Social'),
        ('other', 'Other'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    title = models.CharField(max_length=200)
    description = models.TextField()
    stack = models.CharField(max_length=300, blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, blank=True)
    sphere = models.CharField(max_length=20, choices=SPHERE_CHOICES, blank=True)
    city = models.CharField(max_length=100, blank=True)
    preferred_time = models.CharField(max_length=100, blank=True)
    experience_required = models.CharField(
        max_length=20,
        choices=[('junior', 'Junior'), ('middle', 'Middle'), ('senior', 'Senior'), ('any', 'Any')],
        default='any'
    )
    is_active = models.BooleanField(default=True)
    likes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class PostLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
