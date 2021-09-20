# Websocket Filter
Small Nodejs application to filter certain etherum rpc methods from reaching the backend.

## Env variables
| Variable | Description |
| --- | --- |
| METHOD_BLOCK_LIST | Comma sperated list of method to block (default: none) |
| PORT | Port to listen on (default 8080) |
| WS_TARGET | Target to connect to |