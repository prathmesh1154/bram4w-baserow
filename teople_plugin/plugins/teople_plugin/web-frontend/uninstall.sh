# #!/bin/bash
# # Bash strict mode: http://redsymbol.net/articles/unofficial-bash-strict-mode/
# set -euo pipefail

# # This file is automatically run by Baserow when the plugin is uninstalled.

# # Baserow will automatically `yarn remove` the plugin after this script for you so
# # no need to do that in here.

# # Instead you should undo any changes you've made to the container.

#### `teople-plugin/uninstall_plugin.sh`

```bash
#!/usr/bin/env bash
set -e

# This script is used to uninstall a Baserow plugin.
# It expects the plugin's name (slug) as an argument.

if [ -z "$1" ]; then
    echo "Usage: $0 <plugin_slug>"
    exit 1
fi

PLUGIN_SLUG="$1"
PLUGIN_DIR="/baserow/plugins/${PLUGIN_SLUG}"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo "Plugin directory not found: $PLUGIN_DIR"
    exit 0 # Already uninstalled or never existed
fi

echo "Uninstalling Baserow Plugin: ${PLUGIN_SLUG}"

# Remove the plugin directory
rm -rf "$PLUGIN_DIR"

echo "Baserow Plugin '${PLUGIN_SLUG}' uninstalled successfully."