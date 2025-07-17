from typing import Dict

from baserow.contrib.automation.data_providers.registries import (
    automation_data_provider_type_registry,
)
from baserow.core.formula import get_parse_tree_for_formula
from baserow.core.services.formula_importer import BaserowFormulaImporter


class AutomationFormulaImporter(BaserowFormulaImporter):
    """
    This visitor is used to import formulas in the automation services. It updates the
    paths of the `get()` function calls to reflect the new IDs of the previous node
    formulas.
    """

    def get_data_provider_type_registry(self):
        return automation_data_provider_type_registry


def import_formula(formula: str, id_mapping: Dict[str, str], **kwargs) -> str:
    """
    When a formula is used in an automation, it must be migrated when we import it
    because it could contain IDs referencing other objects.

    :param formula: The formula to import.
    :param id_mapping: The Id map between old and new instances used during import.
    :param kwargs: Sometimes more parameters are needed by the import formula process.
      Extra kwargs are then passed to the underlying migration process.
    :return: The updated path.
    """

    if not formula:
        return formula

    tree = get_parse_tree_for_formula(formula)
    return AutomationFormulaImporter(id_mapping, **kwargs).visit(tree)
