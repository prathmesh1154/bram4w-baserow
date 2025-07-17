"""
SSE Server Transport Module

This module implements a Server-Sent Events (SSE) transport layer for MCP servers.

Example usage:
```
    # Create an SSE transport at an endpoint
    sse = DjangoChannelsSseServerTransport("/messages/")

    # Create Starlette routes for SSE and message handling
    routes = [
        Route("/sse", endpoint=handle_sse),
        Mount("/messages/", app=sse.handle_post_message),
    ]

    # Define handler functions
    async def handle_sse(request):
        async with sse.connect_sse(
            request.scope, request.receive, request._send
        ) as streams:
            await app.run(
                streams[0], streams[1], app.create_initialization_options()
            )

    # Create and run Starlette app
    starlette_app = Starlette(routes=routes)
    uvicorn.run(starlette_app, host="0.0.0.0", port=port)
```

See SseServerTransport class documentation for more details.
"""

import logging
from contextlib import asynccontextmanager
from typing import Any
from urllib.parse import quote
from uuid import UUID, uuid4

import anyio
import mcp.types as types
from anyio.streams.memory import MemoryObjectReceiveStream, MemoryObjectSendStream
from channels.layers import get_channel_layer
from pydantic import ValidationError
from sse_starlette import EventSourceResponse
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import Receive, Scope, Send

logger = logging.getLogger(__name__)


class DjangoChannelsSseServerTransport:
    """
    This class is based on `mcp/server/sse.py`. It tries to stay as close as possible
    to the original implementation, with the only difference that is uses Django
    Channels as session transport layer, so that it's horizontally scalable.
    """

    _endpoint: str

    def __init__(self, endpoint: str) -> None:
        """
        Creates a new SSE server transport, which will direct the client to POST
        messages to the relative or absolute URL given.
        """

        super().__init__()
        self._endpoint = endpoint
        logger.debug(
            f"DjangoChannelsSseServerTransport initialized with endpoint: {endpoint}"
        )

    @asynccontextmanager
    async def connect_sse(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            logger.error("connect_sse received non-HTTP request")
            raise ValueError("connect_sse can only handle HTTP requests")

        logger.debug("Setting up SSE connection")
        read_stream: MemoryObjectReceiveStream[types.JSONRPCMessage | Exception]
        read_stream_writer: MemoryObjectSendStream[types.JSONRPCMessage | Exception]

        write_stream: MemoryObjectSendStream[types.JSONRPCMessage]
        write_stream_reader: MemoryObjectReceiveStream[types.JSONRPCMessage]

        read_stream_writer, read_stream = anyio.create_memory_object_stream(0)
        write_stream, write_stream_reader = anyio.create_memory_object_stream(0)

        session_id = uuid4()
        session_uri = f"{quote(self._endpoint)}?session_id={session_id.hex}"
        # self._read_stream_writers[session_id] = read_stream_writer
        logger.debug(f"Created new session with ID: {session_id}")

        sse_stream_writer, sse_stream_reader = anyio.create_memory_object_stream[
            dict[str, Any]
        ](0)

        channel_layer = get_channel_layer()
        group_name = f"mcp_sse_{session_id.hex}"
        channel_name = f"sse_client_{session_id.hex}"

        async def sse_writer():
            logger.debug("Starting SSE writer")
            async with sse_stream_writer, write_stream_reader:
                await sse_stream_writer.send({"event": "endpoint", "data": session_uri})
                logger.debug(f"Sent endpoint event: {session_uri}")

                async for message in write_stream_reader:
                    logger.debug(f"Sending message via SSE: {message}")
                    await sse_stream_writer.send(
                        {
                            "event": "message",
                            "data": message.model_dump_json(
                                by_alias=True, exclude_none=True
                            ),
                        }
                    )

        async def group_listener():
            logger.debug(f"Listening for incoming messages on group: {group_name}")
            await channel_layer.group_add(group_name, channel_name)
            try:
                while True:
                    message = await channel_layer.receive(channel_name)
                    if message["type"] == "sse.message":
                        try:
                            json_msg = types.JSONRPCMessage.model_validate_json(
                                message["data"]
                            )
                            await read_stream_writer.send(json_msg)
                        except ValidationError as e:
                            logger.error(f"Failed to decode message: {e}")
                            await read_stream_writer.send(e)
            finally:
                await channel_layer.group_discard(group_name, channel_name)

        async with anyio.create_task_group() as tg:
            tg.start_soon(group_listener)
            response = EventSourceResponse(
                content=sse_stream_reader, data_sender_callable=sse_writer
            )
            logger.debug("Starting SSE response task")
            tg.start_soon(response, scope, receive, send)

            logger.debug("Yielding read and write streams")
            yield (read_stream, write_stream)

    async def handle_post_message(
        self, scope: Scope, receive: Receive, send: Send
    ) -> None:
        logger.debug("Handling POST message")
        request = Request(scope, receive)

        session_id_param = request.query_params.get("session_id")
        if session_id_param is None:
            logger.warning("Received request without session_id")
            response = Response("session_id is required", status_code=400)
            return await response(scope, receive, send)

        try:
            session_id = UUID(hex=session_id_param)
            logger.debug(f"Parsed session ID: {session_id}")
        except ValueError:
            logger.warning(f"Received invalid session ID: {session_id_param}")
            response = Response("Invalid session ID", status_code=400)
            return await response(scope, receive, send)

        body = await request.body()
        logger.debug(f"Received JSON: {body}")
        channel_layer = get_channel_layer()

        try:
            message = types.JSONRPCMessage.model_validate_json(body)
            logger.debug(f"Validated client message: {message}")
        except ValidationError as err:
            logger.error(f"Failed to parse message: {err}")
            response = Response("Could not parse message", status_code=400)
            await response(scope, receive, send)
            await channel_layer.group_send(
                f"mcp_sse_{session_id.hex}",
                {
                    "type": "sse.message",
                    "data": str(err),
                },
            )
            return

        logger.debug(f"Sending message to group for session: {session_id}")
        response = Response("Accepted", status_code=202)
        await response(scope, receive, send)
        await channel_layer.group_send(
            f"mcp_sse_{session_id.hex}",
            {
                "type": "sse.message",
                "data": message.model_dump_json(by_alias=True, exclude_none=True),
            },
        )
