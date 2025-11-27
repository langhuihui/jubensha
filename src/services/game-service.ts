import { JubenshaClient, type Room, type Player, type GameState } from 'jubensha-sdk'
import { GAME_CONFIG } from '@/data/game-config'
import { estherScript } from '@/data/esther-script'
import type { Character, Clue } from '@/types/game'

export interface GameRoom extends Room {
  name?: string
  scriptTitle?: string
  hasPassword?: boolean
  status?: 'waiting' | 'playing' | 'ended'
}

export interface ExtendedPlayer extends Player {
  avatar?: string
  character?: Character
  isReady?: boolean
  isAlive?: boolean
}

export interface ExtendedGameState extends GameState {
  players: ExtendedPlayer[]
  availableClues: Clue[]
  currentPhase?: any
  winner?: string
  isEnded?: boolean
  gameLog: Array<{
    timestamp: number
    type: 'system' | 'action' | 'discovery' | 'vote' | 'message'
    content: string
    playerId?: string
  }>
}

class GameService {
  private client: JubenshaClient | null = null
  private currentRoom: GameRoom | null = null
  private currentGameState: ExtendedGameState | null = null
  private currentPlayer: any | null = null

  // 初始化客户端
  async initialize(serverUrl?: string): Promise<void> {
    try {
      this.client = new JubenshaClient({
        serverUrl: serverUrl || GAME_CONFIG.SERVER_URL,
        debug: true,
        gamePhases: GAME_CONFIG.PHASES
      })

      await this.client.connect()
      this.setupEventListeners()

      console.log('[GameService] Client initialized successfully')
    } catch (error) {
      console.error('[GameService] Failed to initialize client:', error)
      throw error
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.client) return

    // 房间事件
    this.client.room.on('playerJoined', (player: Player) => {
      console.log('[GameService] Player joined:', player)
      this.updateGameState()
    })

    this.client.room.on('playerLeft', (playerId: string) => {
      console.log('[GameService] Player left:', playerId)
      this.updateGameState()
    })

    this.client.room.on('roomUpdated', (room: Room) => {
      console.log('[GameService] Room updated:', room)
      this.currentRoom = {
        ...this.currentRoom,
        ...room,
        name: this.currentRoom?.name || '波斯皇宫',
        scriptTitle: estherScript.title
      }
      // Also update game state players
      if (this.currentGameState && room.players) {
        this.currentGameState.players = this.extendPlayers(room.players)
      }
    })

    // 游戏事件
    this.client.game.on('phaseChange', (phase: string) => {
      console.log('[GameService] Phase changed to:', phase)
      if (this.currentGameState) {
        this.currentGameState.phase = phase
      }
      this.addGameLog('system', `游戏阶段切换到: ${this.getPhaseName(phase)}`)
    })

    this.client.game.on('stateUpdate', (state: GameState) => {
      console.log('[GameService] Game state updated:', state)
      this.currentGameState = {
        ...state,
        players: this.extendPlayers((state as any).players || []),
        availableClues: estherScript.clues,
        gameLog: this.currentGameState?.gameLog || []
      }
    })

    // 网络事件
    this.client.network.on('disconnected', () => {
      console.log('[GameService] Network disconnected')
    })

    // 聊天消息监听
    this.client.network.on('message', (message: any) => {
      console.log('[GameService] Received message:', message)

      if (message.type === 'chat:message') {
        console.log('[GameService] Chat message received:', message)
        // 将聊天消息添加到游戏日志（使用message类型）
        this.addGameLog('message', `${message.playerName}: ${message.content}`)
      }
    })

    this.client.network.on('error', (error: Error) => {
      console.error('[GameService] Network error:', error)
    })
  }

  // 扩展玩家数据
  private extendPlayers(players: Player[]): ExtendedPlayer[] {
    return players.map(player => ({
      ...player,
      avatar: '/images/avatars/default.svg',
      character: estherScript.characters.find(c => c.id === player.characterId),
      isReady: false // 可以从服务器状态获取
    }))
  }

  // 添加游戏日志
  private addGameLog(type: 'system' | 'action' | 'discovery' | 'vote' | 'message', content: string, playerId?: string): void {
    if (!this.currentGameState) return

    this.currentGameState.gameLog.push({
      timestamp: Date.now(),
      type,
      content,
      playerId
    })

    // 限制日志数量
    if (this.currentGameState.gameLog.length > 100) {
      this.currentGameState.gameLog = this.currentGameState.gameLog.slice(-50)
    }
  }

  // 获取阶段名称
  private getPhaseName(phaseId: string): string {
    const phase = estherScript.phases.find(p => p.id === phaseId)
    return phase?.name || phaseId
  }

  // 房间管理方法
  async createRoom(playerName: string, maxPlayers: number, password?: string): Promise<{ roomId: string; player: any }> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      const result = await this.client.room.createRoom(estherScript.id, maxPlayers, playerName)

      // 设置当前玩家
      this.currentPlayer = result.player

      // 使用服务器返回的完整数据
      this.currentRoom = {
        id: result.roomId,
        name: '波斯皇宫',
        scriptTitle: estherScript.title,
        hasPassword: !!password,
        maxPlayers: result.room?.maxPlayers || maxPlayers,
        hostId: result.room?.hostId || result.player?.id || '',
        players: result.room?.players || [],
        scriptId: estherScript.id,
        status: (result.room as any)?.status || 'waiting'
      }

      // 初始化游戏状态
      this.currentGameState = {
        phase: 'IDLE',
        round: 1,
        players: this.extendPlayers(result.room?.players || []),
        availableClues: estherScript.clues,
        cluesFound: [],
        votes: {},
        gameLog: []
      }

      this.addGameLog('system', `房间创建成功: ${result.roomId}`)
      return { roomId: result.roomId, player: result.player }
    } catch (error) {
      console.error('[GameService] Failed to create room:', error)
      throw error
    }
  }

  async joinRoom(roomId: string, playerName: string, password?: string): Promise<{ room: any; player: any }> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      const result = await this.client.room.joinRoom(roomId, playerName)

      // 设置当前玩家
      this.currentPlayer = result.player

      // 使用服务器返回的完整数据
      this.currentRoom = {
        id: roomId,
        name: '波斯皇宫',
        scriptTitle: estherScript.title,
        hasPassword: !!password,
        maxPlayers: result.room?.maxPlayers || 6,
        hostId: result.room?.hostId || '',
        players: result.room?.players || [],
        scriptId: estherScript.id,
        status: (result.room as any)?.status || 'waiting'
      }

      // 初始化游戏状态
      this.currentGameState = {
        phase: 'IDLE',
        round: 1,
        players: this.extendPlayers(result.room?.players || []),
        availableClues: estherScript.clues,
        cluesFound: [],
        votes: {},
        gameLog: []
      }

      this.addGameLog('system', `${playerName} 加入了房间`)
      return { room: result.room, player: result.player }
    } catch (error) {
      console.error('[GameService] Failed to join room:', error)
      throw error
    }
  }

  async leaveRoom(): Promise<void> {
    if (!this.client) return

    try {
      await this.client.room.leaveRoom()
      this.currentRoom = null
      this.currentGameState = null
    } catch (error) {
      console.error('[GameService] Failed to leave room:', error)
      throw error
    }
  }

  // 游戏管理方法
  async startGame(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      await this.client.game.startGame('character_introduction')
      this.addGameLog('system', '游戏开始！')
    } catch (error) {
      console.error('[GameService] Failed to start game:', error)
      throw error
    }
  }

  async nextPhase(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      await this.client.game.nextPhase()
    } catch (error) {
      console.error('[GameService] Failed to change phase:', error)
      throw error
    }
  }

  async submitClue(clueId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      await this.client.game.submitClue(clueId)
      this.addGameLog('discovery', `发现了线索: ${this.getClueName(clueId)}`)
    } catch (error) {
      console.error('[GameService] Failed to submit clue:', error)
      throw error
    }
  }

  // 获取线索名称
  private getClueName(clueId: string): string {
    const clue = estherScript.clues.find(c => c.id === clueId)
    return clue?.name || clueId
  }

  // 获取当前状态
  getCurrentRoom(): GameRoom | null {
    return this.currentRoom
  }

  getCurrentGameState(): ExtendedGameState | null {
    return this.currentGameState
  }

  // 更新游戏状态
  private async updateGameState(): Promise<void> {
    // 这里可以从服务器获取最新状态
    // 暂时使用本地状态
  }

  // 获取可用房间列表（模拟）
  async getRoomList(): Promise<GameRoom[]> {
    // 模拟房间列表API
    return [
      {
        id: 'ABC123',
        name: '波斯皇宫',
        scriptTitle: estherScript.title,
        hasPassword: false,
        maxPlayers: 6,
        hostId: '1',
        players: [],
        scriptId: estherScript.id
      },
      {
        id: 'DEF456',
        name: '王后宴会',
        scriptTitle: estherScript.title,
        hasPassword: true,
        maxPlayers: 6,
        hostId: '2',
        players: [],
        scriptId: estherScript.id
      }
    ]
  }

  // 发送聊天消息
  async sendMessage(roomId: string, content: string): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    if (!content.trim()) {
      return
    }

    try {
      // 直接通过WebSocket发送消息
      const message = {
        type: 'chat:message',
        roomId,
        content: content.trim(),
        timestamp: Date.now(),
        playerId: this.currentPlayer?.id || 'unknown',
        playerName: this.currentPlayer?.name || 'Unknown'
      }

      // 通过jubensha-sdk发送消息
      console.log('[GameService] Sending message:', message)

      // 尝试不同的SDK发送方法
      try {
        // 方法1: 尝试直接发送
        if (typeof this.client.network.send === 'function') {
          // 如果send接受对象参数
          (this.client.network.send as any)(message)
          console.log('[GameService] Message sent via network.send')
        }
        // 方法2: 尝试通过游戏API发送
        else if ((this.client.game as any).sendMessage) {
          await (this.client.game as any).sendMessage(roomId, content)
          console.log('[GameService] Message sent via game.sendMessage')
        }
        // 方法3: 直接通过WebSocket连接发送
        else {
          const messageStr = JSON.stringify(message)
          if ((this.client as any).ws && (this.client as any).ws.send) {
            (this.client as any).ws.send(messageStr)
            console.log('[GameService] Message sent via WebSocket')
          } else {
            console.warn('[GameService] No available send method found, message added to local log only')
          }
        }
      } catch (sendError) {
        console.warn('[GameService] Send method failed, message added to local log only:', sendError)
      }

      // 添加到本地日志
      this.addGameLog('message', content.trim(), this.currentPlayer?.id)
    } catch (error) {
      console.error('[GameService] Failed to send message:', error)
      throw error
    }
  }

  // 投票
  async vote(targetPlayerId: string): Promise<void> {
    // 实现投票逻辑
    this.addGameLog('vote', `投票给了玩家: ${targetPlayerId}`)
  }

  // 断开连接
  disconnect(): void {
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
    this.currentRoom = null
    this.currentGameState = null
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.client !== null && (this.client.network as any).isConnected
  }
}

export default GameService