from django.urls import path
from . import views

app_name = 'teople_plugin'

urlpatterns = [
    path('teams/', views.TeamView.as_view(), name='teams'),
    path('teams/<int:team_id>/', views.TeamDetailView.as_view(), name='team_detail'),
    path('members/', views.MemberView.as_view(), name='members'),
]