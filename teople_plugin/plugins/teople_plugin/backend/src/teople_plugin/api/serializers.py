from rest_framework import serializers
from ..models import Team, TeamMember

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'email', 'role', 'is_active', 'team']
        read_only_fields = ['id']