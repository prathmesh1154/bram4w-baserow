from django.db import models
from baserow.core.models import Application

class Team(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']

class TeamMember(models.Model):
    team = models.ForeignKey(Team, related_name='members', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']