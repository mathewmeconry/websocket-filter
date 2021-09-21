// Load .env file first
import { config } from 'dotenv'
config()

import WebSocket, { Server } from 'ws';
import Logger, { LogLevel } from './logger';

interface rpcCall {
  jsonrpc: string;
  id: number;
  method: string;
  params: any[];
}

// initializes logger
const logger = new Logger(LogLevel.INFO)

// check if WS_TARGET is set
if (!process.env.WS_TARGET) {
  logger.error('WS_TARGET is not set')
  process.exit(1)
}

// generates blocklist
let blockList: string[] = []
if (process.env.METHOD_BLOCK_LIST) {
  blockList = process.env.METHOD_BLOCK_LIST.split(',').map(method => method.trim())
}

// create new server to listen for incoming connections
const wss = new Server({
  port: parseInt(process.env.PORT || '8080'),
});
logger.info(`Starting server on ${wss.options.port} with blocklist ${blockList.join(',')}`)

// on connection, create a new client
wss.on('connection', (socket, req) => {
  let ip = '-'
  const headers = req.headers as { 'x-forwarded-for'?: string }
  if (headers.hasOwnProperty('x-forwarded-for') && headers['x-forwarded-for']) {
    ip = headers['x-forwarded-for'].split(',')[0].trim()
  }
  // for each client create a new client to WS_TARGET
  const targetClient = new WebSocket(process.env.WS_TARGET || '');
  let targetReady = false
  let targetClosed = false

  // helper function to wait for WS_TARGET client to become ready
  async function waitForTarget(): Promise<Boolean> {
    if (!targetReady) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return waitForTarget()
    }
    return true
  }

  // WS_TARGET client setup
  targetClient.on('open', () => {
    targetReady = true
    targetClient.on('message', (msg: Buffer) => {
      socket.send(msg.toString())
    })
  })

  // for each message from client, send to WS_TARGET
  socket.on('message', async (msg: Buffer) => {
    const rpcCall: rpcCall = JSON.parse(msg.toString())
    logger.logMethodCall(ip, rpcCall.method)

    // check if method is allowed, if not close the connection and the WS_TARGET client
    if (blockList.includes(rpcCall.method)) {
      socket.close()
      await waitForTarget()
      targetClient.close()
      targetClosed = true
      logger.info(`Dropped connection because of blocklist`)
      return
    }

    // check if WS_TARGET client is ready
    await waitForTarget()

    // send message to WS_TARGET if target is not closed
    if (!targetClosed) {
      targetClient.send(msg, (err) => {
        if (err) {
          logger.error(`Error from target upstream: ${err.message}`)
        }
      })
    }
  });
});

