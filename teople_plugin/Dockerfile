FROM baserow/baserow:1.33.4

COPY ./plugins/teople_plugin/ /baserow/plugins/teople_plugin/
RUN /baserow/plugins/install_plugin.sh --folder /baserow/plugins/teople_plugin
