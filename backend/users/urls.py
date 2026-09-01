from django.urls import path
from .views import RegisterView, MeView, UserDetailView, FollowToggleView, SuggestUsersView, UserFollowersView, UserFollowingView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('suggested/', SuggestUsersView.as_view(), name='suggested-users'),
    path('<str:username>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    path('<str:username>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('<str:username>/following/', UserFollowingView.as_view(), name='user-following'),
    path('<str:username>/', UserDetailView.as_view(), name='user-detail'),
]