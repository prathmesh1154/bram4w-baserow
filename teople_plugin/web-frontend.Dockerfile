FROM baserow/web-frontend:1.33.4

USER root

COPY ./plugins/teople_plugin/ /baserow/plugins/teople_plugin/
RUN /baserow/plugins/install_plugin.sh --folder /baserow/plugins/teople_plugin

USER $UID:$GID
