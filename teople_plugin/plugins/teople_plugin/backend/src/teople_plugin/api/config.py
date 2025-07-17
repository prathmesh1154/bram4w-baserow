from django.apps import AppConfig

class TeoplePluginConfig(AppConfig):
    name = 'teople_plugin'
    def ready(self):
        from . import urls  # This registers your URLs