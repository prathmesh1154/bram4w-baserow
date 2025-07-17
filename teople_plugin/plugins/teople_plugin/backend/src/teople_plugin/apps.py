from baserow.plugins import BaserowPlugin

class TeoplePlugin(BaserowPlugin):
    def get_urls(self):
        from . import urls
        return urls.urlpatterns