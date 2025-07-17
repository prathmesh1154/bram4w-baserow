import os
import re
from typing import Iterable

ROOT_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)) + "/..")

MIGRATION_DIRS = [
    ROOT_DIR + "/contrib/database/migrations",
    # Add more migration directories here if needed.
]

# Matches all SQL functions in migration files.
FORMULA_PATTERN = re.compile(
    r"create or replace function.*?language plpgsql;|create or replace function.*?language sql immutable strict;",
    re.DOTALL | re.IGNORECASE,
)


def iter_formula_pgsql_functions() -> Iterable[str]:
    """
    Iterates over all custom pgSQL functions in the migration files and yields the
    content of the functions so they can be installed without running the migrations.

    :return: An iterable with the content of the pgSQL functions.
    """

    for migrations_dir in MIGRATION_DIRS:
        for root, _, files in os.walk(migrations_dir):
            for file in files:
                if file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r") as f:
                        content = f.read()
                        matches = FORMULA_PATTERN.findall(content)
                        for match in matches:
                            yield match.replace("\\\\", "\\")
