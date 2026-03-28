"""
Run this once:
  python manage.py shell < seed_data.py
"""
from posts.models import Category
categories = [
    ('Study', '📚', '#6366f1'),
    ('Sport', '⚽', '#10b981'),
    ('Project', '💻', '#3b82f6'),
    ('Travel', '✈️', '#f59e0b'),
    ('Gaming', '🎮', '#ec4899'),
    ('Music', '🎵', '#8b5cf6'),
    ('Cooking', '🍳', '#ef4444'),
    ('Books', '📖', '#06b6d4'),
    ('Art', '🎨', '#f97316'),
    ('Business', '💼', '#64748b'),
    ('Tech', '🔧', '#0ea5e9'),
    ('Other', '💡', '#94a3b8'),
]
for name, icon, color in categories:
    Category.objects.get_or_create(name=name, defaults={'icon': icon, 'color': color})
print("Categories seeded!")
