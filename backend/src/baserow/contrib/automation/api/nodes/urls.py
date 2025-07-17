from django.urls import re_path

from baserow.contrib.automation.api.nodes.views import (
    AutomationNodesView,
    AutomationNodeView,
    DuplicateAutomationNodeView,
    OrderAutomationNodesView,
)

app_name = "baserow.contrib.automation.api.nodes"

urlpatterns = [
    re_path(
        r"workflow/(?P<workflow_id>[0-9]+)/nodes/$",
        AutomationNodesView.as_view(),
        name="list",
    ),
    re_path(
        r"node/(?P<node_id>[0-9]+)/$",
        AutomationNodeView.as_view(),
        name="item",
    ),
    re_path(
        r"workflow/(?P<workflow_id>[0-9]+)/order/$",
        OrderAutomationNodesView.as_view(),
        name="order",
    ),
    re_path(
        r"node/(?P<node_id>[0-9]+)/duplicate/$",
        DuplicateAutomationNodeView.as_view(),
        name="duplicate",
    ),
]
