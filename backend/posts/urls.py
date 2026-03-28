from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list),
    path('create/', views.post_create),
    path('<int:pk>/', views.PostDetailView.as_view()),
    path('<int:pk>/like/', views.toggle_like),
    path('mine/', views.MyPostsView.as_view()),
    path('categories/', views.category_list),
    path('recommended/', views.recommended_posts),
]
