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
  })

  gameServer.on('room:create', (data, client) => {
    console.log('房间创建请求:', data)
  })

  gameServer.on('room:join', (data, client) => {
    console.log('加入房间请求:', data)
  })

  gameServer.on('chat:message', (data, client) => {
    console.log('聊天消息:', data)
  })
} else {
  console.log('当前版本的jubensha-sdk不支持事件监听器')
  console.log('gameServer实例:', typeof gameServer)
  console.log('可用方法:', Object.getOwnPropertyNames(gameServer))
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...')
  process.exit(0)
})

console.log('服务器初始化完成')