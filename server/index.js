import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { JubenshaServer } from 'jubensha-sdk/server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 8080

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

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...')
  process.exit(0)
})

console.log('服务器初始化完成')