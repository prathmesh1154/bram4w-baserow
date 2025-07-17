import json

import pytest

from baserow.contrib.automation.application_types import AutomationApplicationType
from baserow.contrib.automation.models import Automation
from baserow.contrib.automation.nodes.models import (
    LocalBaserowCreateRowActionNode,
    LocalBaserowRowsCreatedTriggerNode,
)
from baserow.core.registries import ImportExportConfig

SAMPLE_WORKFLOW_IMPORT_REFERENCE = {
    "id": 1,
    "name": "Sample automation",
    "order": 1,
    "type": "automation",
    "integrations": [
        {
            "id": 1,
            "name": "Local Baserow",
            "order": "1.00000000000000000000",
            "type": "local_baserow",
            "authorized_user": "test@baserow.io",
        }
    ],
    "workflows": [
        {
            "id": 1,
            "name": "Sample workflow",
            "order": 1,
            "nodes": [
                {
                    "id": 1,
                    "type": "rows_created",
                    "order": "1.00000000000000000000",
                    "workflow_id": 1,
                    "parent_node_id": None,
                    "previous_node_id": None,
                    "previous_node_output": "",
                    "service": {
                        "id": 549,
                        "integration_id": 1,
                        "type": "local_baserow_rows_created",
                        "table_id": 705,
                    },
                },
                {
                    "id": 2,
                    "type": "create_row",
                    "order": "2.00000000000000000000",
                    "workflow_id": 1,
                    "parent_node_id": None,
                    "previous_node_id": 1,
                    "previous_node_output": "",
                    "service": {
                        "id": 550,
                        "integration_id": 1,
                        "type": "local_baserow_upsert_row",
                        "table_id": 123,
                        "row_id": "",
                        "field_mappings": [
                            {
                                "field_id": 123,
                                "value": "get('previous_node.1.0.field_123')",
                                "enabled": True,
                            },
                            {"field_id": 6826, "value": "", "enabled": False},
                            {"field_id": 6831, "value": "", "enabled": False},
                        ],
                    },
                },
            ],
        }
    ],
}


@pytest.mark.django_db
def test_automation_export_serialized(data_fixture):
    user = data_fixture.create_user(email="test@baserow.io")
    automation = data_fixture.create_automation_application(user=user)
    integration = data_fixture.create_local_baserow_integration(
        authorized_user=user, application=automation
    )
    workflow = data_fixture.create_automation_workflow(automation=automation)
    trigger = data_fixture.create_local_baserow_rows_created_trigger_node(
        workflow=workflow
    )
    first_action = data_fixture.create_local_baserow_create_row_action_node(
        workflow=workflow, previous_node=trigger, previous_node_id=trigger.id
    )
    serialized = AutomationApplicationType().export_serialized(
        automation, ImportExportConfig(include_permission_data=True)
    )
    serialized = json.loads(json.dumps(serialized))

    reference = {
        "id": automation.id,
        "name": automation.name,
        "order": automation.order,
        "type": "automation",
        "integrations": [
            {
                "id": integration.id,
                "name": integration.name,
                "order": str(integration.order),
                "type": "local_baserow",
                "authorized_user": None,
            }
        ],
        "workflows": [
            {
                "id": workflow.id,
                "name": workflow.name,
                "order": workflow.order,
                "nodes": [
                    {
                        "id": trigger.id,
                        "type": "rows_created",
                        "order": str(trigger.order),
                        "workflow_id": trigger.workflow_id,
                        "parent_node_id": trigger.parent_node_id,
                        "previous_node_id": trigger.previous_node_id,
                        "previous_node_output": trigger.previous_node_output,
                        "service": {
                            "id": trigger.service_id,
                            "integration_id": trigger.service.specific.integration.id,
                            "type": "local_baserow_rows_created",
                            "table_id": trigger.service.specific.table_id,
                        },
                    },
                    {
                        "id": first_action.id,
                        "type": "create_row",
                        "order": str(first_action.order),
                        "workflow_id": first_action.workflow_id,
                        "parent_node_id": first_action.parent_node_id,
                        "previous_node_id": first_action.previous_node_id,
                        "previous_node_output": first_action.previous_node_output,
                        "service": {
                            "id": first_action.service_id,
                            "integration_id": first_action.service.specific.integration_id,
                            "type": "local_baserow_upsert_row",
                            "table_id": first_action.service.specific.table_id,
                            "row_id": "",
                            "field_mappings": [],
                        },
                    },
                ],
            }
        ],
    }

    assert serialized == reference


@pytest.mark.django_db
def test_automation_init_application(data_fixture):
    user = data_fixture.create_user()
    automation = data_fixture.create_automation_application(
        name="Automation", user=user
    )

    assert automation.workflows.count() == 0

    AutomationApplicationType().init_application(user, automation)

    assert automation.workflows.count() == 1


@pytest.mark.django_db
def test_automation_application_import(data_fixture):
    user = data_fixture.create_user(email="test@baserow.io")
    workspace = data_fixture.create_workspace(user=user)
    database = data_fixture.create_database_application(workspace=workspace)
    table = data_fixture.create_database_table(database=database)
    text_field = data_fixture.create_text_field(table=table)

    id_mapping = {
        "database_tables": {123: table.id},
        "database_fields": {123: text_field.id},
    }

    serialized = SAMPLE_WORKFLOW_IMPORT_REFERENCE.copy()
    automation = AutomationApplicationType().import_serialized(
        workspace,
        serialized,
        ImportExportConfig(include_permission_data=True),
        id_mapping,
    )

    assert automation.id != serialized["id"]

    assert automation.integrations.count() == 1
    first_integration = automation.integrations.first().specific
    assert first_integration.authorized_user.id == user.id

    assert automation.workflows.count() == 1
    workflow = automation.workflows.first()

    assert workflow.automation_workflow_nodes.count() == 2
    [trigger, action_node] = workflow.automation_workflow_nodes.order_by("order")

    assert isinstance(trigger.specific, LocalBaserowRowsCreatedTriggerNode)

    create_row_node = action_node.specific
    assert isinstance(create_row_node, LocalBaserowCreateRowActionNode)
    assert create_row_node.previous_node_id == trigger.id

    # Make sure the table/integration migrated properly.
    create_row_service = create_row_node.service.specific
    assert create_row_service.table_id == table.id
    assert create_row_service.integration.id == first_integration.id

    # Make sure the field mappings have migrated.
    create_row_mapping = create_row_service.field_mappings.get(enabled=True)
    assert create_row_mapping.field_id == text_field.id
    assert (
        create_row_mapping.value
        == f"get('previous_node.{trigger.id}.0.field_{text_field.id}')"
    )


@pytest.mark.django_db
def test_fetch_workflows_to_serialize_without_user(data_fixture):
    workflow = data_fixture.create_automation_workflow(name="test")

    workflows = AutomationApplicationType().fetch_workflows_to_serialize(
        workflow.automation,
        None,
    )

    assert workflows == [workflow]


@pytest.mark.django_db
def test_fetch_workflows_to_serialize_with_user(data_fixture):
    user = data_fixture.create_user()
    workflow = data_fixture.create_automation_workflow(name="test", user=user)

    workflows = AutomationApplicationType().fetch_workflows_to_serialize(
        workflow.automation,
        user,
    )

    assert workflows == [workflow]


@pytest.mark.django_db
def test_enhance_queryset(data_fixture, django_assert_num_queries):
    user = data_fixture.create_user()

    # Create two automations with 2 workflows each
    workflow_1 = data_fixture.create_automation_workflow(user=user)
    data_fixture.create_automation_workflow(automation=workflow_1.automation, user=user)

    workflow_3 = data_fixture.create_automation_workflow(user=user)
    data_fixture.create_automation_workflow(automation=workflow_3.automation, user=user)

    # query 1: fetch all automations
    # query 2: fetch all workflows for automation 1
    # query 3: fetch all workflows for automation 2
    expected_queries = 3
    with django_assert_num_queries(expected_queries):
        [
            workflow.name
            for automation in Automation.objects.all()
            for workflow in automation.workflows.all()
        ]

    queryset = AutomationApplicationType().enhance_queryset(Automation.objects.all())

    # query 1: fetch all automations
    # query 2: fetch all workflows for automation 2
    expected_queries = 2
    with django_assert_num_queries(expected_queries):
        [
            workflow.name
            for automation in queryset
            for workflow in automation.workflows.all()
        ]
