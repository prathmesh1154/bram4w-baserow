from baserow.core.registries import plugin_registry

from django.apps import AppConfig


class PluginConfig(AppConfig):
    name = 'teople_plugin'
    label = 'teople_plugin'

    def ready(self):
        from .plugins import TeoplePlugin
        plugin_registry.register(TeoplePlugin())