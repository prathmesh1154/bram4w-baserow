from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from baserow.api.decorators import map_exceptions
from baserow.api.schemas import get_error_schema

from ..models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer

class TeamView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        teams = Team.objects.filter(application__workspace__users=request.user)
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TeamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeamDetailView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request, team_id):
        team = Team.objects.get(id=team_id, application__workspace__users=request.user)
        serializer = TeamSerializer(team)
        return Response(serializer.data)