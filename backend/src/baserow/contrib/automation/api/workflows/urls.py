from django.urls import re_path

from baserow.contrib.automation.api.workflows.views import (
    AsyncAutomationDuplicateWorkflowView,
    AutomationWorkflowsView,
    AutomationWorkflowView,
    OrderAutomationWorkflowsView,
)

app_name = "baserow.contrib.automation.api.workflows"

urlpatterns_with_automation_id = [
    re_path(
        r"$",
        AutomationWorkflowsView.as_view(),
        name="create",
    ),
    re_path(r"order/$", OrderAutomationWorkflowsView.as_view(), name="order"),
]

urlpatterns_without_automation_id = [
    re_path(
        r"(?P<workflow_id>[0-9]+)/$",
        AutomationWorkflowView.as_view(),
        name="item",
    ),
    re_path(
        r"(?P<workflow_id>[0-9]+)/duplicate/async/$",
        AsyncAutomationDuplicateWorkflowView.as_view(),
        name="async_duplicate",
    ),
]
