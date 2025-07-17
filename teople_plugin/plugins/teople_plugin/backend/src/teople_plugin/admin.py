from django.contrib import admin
from .models import Team, TeamMember

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'application', 'created_at')
    search_fields = ('name',)

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'team', 'is_active')
    list_filter = ('is_active', 'team')
    search_fields = ('name', 'email')
    