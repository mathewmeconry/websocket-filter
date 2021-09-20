import WebSocket, { Server } from 'ws';

interface rpcCall {
  jsonrpc: string;
  id: number;
  method: string;
  params: any[];
}

let blockList: string[] = ['']
if (process.env.METHOD_BLOCK_LIST) {
  blockList = process.env.METHOD_BLOCK_LIST.split(',').map(method => method.trim())
}

const wss = new Server({
  port: parseInt(process.env.PORT || '8080'),
});

wss.on('connection', (socket) => {
  console.log('New connection')
  const targetClient = new WebSocket(process.env.WS_TARGET || '');
  let targetReady = false
  let targetClosed = false

  async function waitForTarget(): Promise<Boolean> {
    if (!targetReady) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return waitForTarget()
    }
    return true
  }

  targetClient.on('open', () => {
    targetReady = true
    targetClient.on('message', (msg: Buffer) => {
      socket.send(msg.toString())
    })
  })

  socket.on('message', async (msg: Buffer) => {
    const rpcCall: rpcCall = JSON.parse(msg.toString())
    if (blockList.includes(rpcCall.method)) {
      socket.close()
      await waitForTarget()
      targetClient.close()
      targetClosed = true
      console.log(`Dropped connection because of blocklist`)
      return
    }
    await waitForTarget()
    if (!targetClosed) {
      targetClient.send(msg, (err) => {
        if (err) {
          console.error(`Error from target upstream: ${err.message}`)
        }
      })
    }
  });
});

