from baserow.core.registries import PluginRegistry
from django.urls import path, include

class TeoplePlugin(PluginRegistry):
    type = 'teople_plugin'
    
    def get_api_urls(self):
        
        urlpatterns = [
        path('teople/', include('teople_plugin.api.urls')),  # Include API URLs
    ]