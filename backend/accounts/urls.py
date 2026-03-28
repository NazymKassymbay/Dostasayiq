from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('profile/', views.ProfileView.as_view()),
    path('profile/<str:username>/', views.ProfileView.as_view()),
    path('users/', views.user_list_view),
    path('messages/unread/count/', views.unread_count_view),
    path('messages/', views.MessageView.as_view()),
    path('messages/<str:username>/', views.MessageView.as_view()),
]
