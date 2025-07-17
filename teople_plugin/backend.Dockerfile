FROM baserow/backend:1.33.4

USER root

COPY ./teople_plugin /baserow/plugins/teople_plugin

RUN pip install -e /baserow/plugins/teople_plugin/backend

USER $UID:$GID
