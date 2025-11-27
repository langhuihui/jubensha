import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { JubenshaServer } from 'jubensha-sdk/server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
// 从命令行参数获取端口，默认8080
const PORT = process.env.PORT || process.argv[2] || 8080

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')))

// 处理所有其他请求，返回 index.html (SPA 支持)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// 创建HTTP服务器
const server = app.listen(PORT, () => {
  console.log(`服务器启动成功！`)
  console.log(`HTTP服务器运行在: http://localhost:${PORT}`)
  console.log(`WebSocket服务器运行在: ws://localhost:${PORT}/ws`)
})

// 创建WebSocket服务器
const gameServer = new JubenshaServer({ server, path: '/ws' })

console.log('WebSocket服务器初始化完成')

// 存储房间信息
const rooms = new Map()

// 尝试添加事件监听器（如果SDK支持）
if (typeof gameServer.on === 'function') {
  gameServer.on('connection', (client) => {
    console.log(`新客户端连接: ${client.id}`)
  })

  gameServer.on('disconnect', (client) => {
    console.log(`客户端断开连接: ${client.id}`)
  })

  gameServer.on('message', (client, message) => {
    console.log(`收到消息 [${message.type}]:`, message)

    // 处理聊天消息
    if (message.type === 'chat:message') {
      console.log(`聊天消息: [${message.playerName}] ${message.content}`)

      // 广播消息给房间内的所有玩家
      const roomId = message.roomId
      if (gameServer.wss) {
        gameServer.wss.clients.forEach((ws) => {
          if (ws.readyState === ws.OPEN) {
            // 简单广播，实际应用中可以根据roomId过滤
            ws.send(JSON.stringify({
              type: 'chat:message',
              ...message,
              timestamp: Date.now()
            }))
          }
        })
      }
    }
  })

  gameServer.on('room:create', (data, client) => {
    console.log('房间创建请求:', data)
  })

  gameServer.on('room:join', (data, client) => {
    console.log('加入房间请求:', data)
  })
} else {
  console.log('当前版本的jubensha-sdk不支持事件监听器')
  console.log('gameServer实例:', typeof gameServer)
  console.log('可用方法:', Object.getOwnPropertyNames(gameServer))

  // 如果SDK不支持事件监听器，直接使用WebSocket
  server.on('upgrade', (request, socket, head) => {
    console.log('WebSocket升级请求')
  })

  // 添加自定义消息处理
  if (gameServer.wss) {
    gameServer.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection established')

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log('收到消息:', message)

          // 处理聊天消息
          if (message.type === 'chat:message') {
            console.log(`聊天消息: [${message.playerName}] ${message.content}`)

            // 广播消息给房间内的所有玩家
            gameServer.wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat:message',
                  ...message,
                  timestamp: Date.now()
                }))
              }
            })
          }
        } catch (error) {
          console.log('Unknown message type:', data.toString())
        }
      })

      ws.on('close', () => {
        console.log('WebSocket connection closed')
      })
    })
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...')
  process.exit(0)
})

console.log('服务器初始化完成')