import { WebSocketServer } from 'ws'
import WebSocket from 'ws'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 8080

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')))

// 服务器主页
app.get('/', (req, res) => {
  res.send(`
    <h1>以斯帖记剧本杀游戏服务器</h1>
    <p>服务器正在运行...</p>
    <p>WebSocket端口: ${PORT}</p>
    <p>客户端连接地址: ws://localhost:${PORT}</p>
  `)
})

// 创建WebSocket服务器
const wss = new WebSocketServer({ port: PORT })

console.log(`服务器启动成功！`)
console.log(`WebSocket服务器运行在: ws://localhost:${PORT}`)

// 存储房间和玩家数据
const rooms = new Map()
const players = new Map()

// 消息处理器
const messageHandlers = {
  // 创建房间
  'room:create': (ws, data) => {
    const roomId = generateRoomId()
    const room = {
      id: roomId,
      hostId: data.playerId,
      scriptId: data.scriptId,
      maxPlayers: data.maxPlayers,
      players: [],
      status: 'waiting',
      createdAt: Date.now()
    }

    rooms.set(roomId, room)

    // 将房主加入房间
    const player = {
      id: data.playerId,
      name: data.playerName,
      isHost: true,
      status: 'online',
      joinedAt: Date.now()
    }

    room.players.push(player)
    players.set(data.playerId, { ...player, roomId })

    ws.roomId = roomId
    ws.playerId = data.playerId

    console.log(`房间创建成功: ${roomId}, 房主: ${data.playerName}`)

    ws.send(JSON.stringify({
      type: 'room:created',
      data: { roomId, room }
    }))

    broadcastToRoom(roomId, {
      type: 'room:playerJoined',
      data: { player }
    }, ws)
  },

  // 加入房间
  'room:join': (ws, data) => {
    const { roomId, playerName, playerId } = data
    const room = rooms.get(roomId)

    if (!room) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '房间不存在'
      }))
    }

    if (room.players.length >= room.maxPlayers) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '房间已满'
      }))
    }

    if (room.status !== 'waiting') {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '游戏已开始'
      }))
    }

    const player = {
      id: playerId,
      name: playerName,
      isHost: false,
      status: 'online',
      joinedAt: Date.now()
    }

    room.players.push(player)
    players.set(playerId, { ...player, roomId })

    ws.roomId = roomId
    ws.playerId = playerId

    console.log(`玩家加入房间: ${playerName} -> ${roomId}`)

    ws.send(JSON.stringify({
      type: 'room:joined',
      data: { room, player }
    }))

    broadcastToRoom(roomId, {
      type: 'room:playerJoined',
      data: { player }
    }, ws)
  },

  // 离开房间
  'room:leave': (ws, data) => {
    handlePlayerLeave(ws)
  },

  // 开始游戏
  'game:start': (ws, data) => {
    const { roomId } = ws
    const room = rooms.get(roomId)

    if (!room) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '房间不存在'
      }))
    }

    if (room.hostId !== ws.playerId) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '只有房主可以开始游戏'
      }))
    }

    room.status = 'playing'
    room.gameStartedAt = Date.now()

    console.log(`游戏开始: ${roomId}`)

    broadcastToRoom(roomId, {
      type: 'game:started',
      data: { room }
    })
  },

  // 游戏阶段更新
  'game:phaseUpdate': (ws, data) => {
    const { roomId } = ws
    const room = rooms.get(roomId)

    if (!room) return

    console.log(`游戏阶段更新: ${roomId} -> ${data.phase}`)

    broadcastToRoom(roomId, {
      type: 'game:phaseChanged',
      data: { phase: data.phase, playerId: ws.playerId }
    })
  },

  // 发现线索
  'game:clueFound': (ws, data) => {
    const { roomId } = ws
    const room = rooms.get(roomId)

    if (!room) return

    console.log(`线索发现: ${roomId} -> ${data.clueId}`)

    broadcastToRoom(roomId, {
      type: 'game:clueDiscovered',
      data: { clueId: data.clueId, playerId: ws.playerId }
    })
  },

  // 聊天消息
  'chat:message': (ws, data) => {
    const { roomId } = ws
    const room = rooms.get(roomId)

    if (!room) return

    const player = room.players.find(p => p.id === ws.playerId)
    if (!player) return

    console.log(`聊天消息: ${roomId} -> ${player.name}: ${data.message}`)

    broadcastToRoom(roomId, {
      type: 'chat:message',
      data: {
        playerId: ws.playerId,
        playerName: player.name,
        message: data.message,
        timestamp: Date.now()
      }
    })
  }
}

// 处理玩家离开
function handlePlayerLeave(ws) {
  const { roomId, playerId } = ws

  if (!roomId || !playerId) return

  const room = rooms.get(roomId)
  if (!room) return

  const playerIndex = room.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return

  const player = room.players[playerIndex]
  room.players.splice(playerIndex, 1)

  players.delete(playerId)

  console.log(`玩家离开房间: ${player.name} <- ${roomId}`)

  // 如果房主离开，指定新房主或删除房间
  if (player.isHost) {
    if (room.players.length > 0) {
      room.players[0].isHost = true
      room.hostId = room.players[0].id

      broadcastToRoom(roomId, {
        type: 'room:hostChanged',
        data: { newHostId: room.players[0].id }
      })
    } else {
      rooms.delete(roomId)
      return
    }
  }

  broadcastToRoom(roomId, {
    type: 'room:playerLeft',
    data: { playerId, playerName: player.name }
  })
}

// 向房间内所有玩家广播消息
function broadcastToRoom(roomId, message, excludeWs = null) {
  const messageStr = JSON.stringify(message)

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN &&
        client.roomId === roomId &&
        client !== excludeWs) {
      client.send(messageStr)
    }
  })
}

// 生成房间ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// WebSocket连接处理
wss.on('connection', (ws, request) => {
  console.log('新的WebSocket连接建立')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      const handler = messageHandlers[data.type]

      if (handler) {
        handler(ws, data)
      } else {
        console.log('未知的消息类型:', data.type)
      }
    } catch (error) {
      console.error('消息解析错误:', error)
    }
  })

  ws.on('close', () => {
    console.log('WebSocket连接关闭')
    handlePlayerLeave(ws)
  })

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error)
    handlePlayerLeave(ws)
  })

  // 发送连接成功消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: { message: '连接成功', timestamp: Date.now() }
  }))
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...')
  wss.close()
  process.exit(0)
})

console.log('服务器初始化完成')