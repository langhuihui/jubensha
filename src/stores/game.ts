import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import GameService, { type GameRoom, type ExtendedPlayer, type ExtendedGameState } from '@/services/game-service'
import { estherScript } from '@/data/esther-script'
import { GAME_CONFIG } from '@/data/game-config'
import type { Character, Clue } from '@/types/game'

export const useGameStore = defineStore('game', () => {
  // 游戏服务实例
  const gameService = ref<GameService | null>(null)

  // 连接状态
  const isConnected = ref(false)
  const isConnecting = ref(false)

  // 当前房间
  const currentRoom = ref<GameRoom | null>(null)

  // 当前玩家
  const currentPlayer = ref<ExtendedPlayer | null>(null)

  // 游戏状态
  const gameState = ref<ExtendedGameState | null>(null)

  // 错误状态
  const error = ref<string | null>(null)

  // 计算属性
  const isHost = computed(() => {
    return currentPlayer.value?.isHost || false
  })

  const isGameStarted = computed(() => {
    return gameState.value?.phase !== 'IDLE'
  })

  const canStartGame = computed(() => {
    if (!currentRoom.value || !gameState.value) return false

    const players = gameState.value.players || []
    return (
      players.length >= estherScript.minPlayers &&
      players.every(p => p.isReady || p.isHost) &&
      currentRoom.value.status === 'waiting'
    )
  })

  const currentPhaseInfo = computed(() => {
    if (!gameState.value) return null
    return estherScript.phases.find(p => p.id === gameState.value?.phase)
  })

  const myCharacter = computed(() => {
    if (!currentPlayer.value?.characterId) return null
    return estherScript.characters.find(c => c.id === currentPlayer.value?.characterId)
  })

  const availableClues = computed(() => {
    if (!gameState.value) return []

    const discoveredClueIds = gameState.value.cluesFound || []
    return estherScript.clues.filter(clue =>
      !discoveredClueIds.includes(clue.id)
    )
  })

  const myDiscoveredClues = computed(() => {
    if (!gameState.value || !currentPlayer.value) return []

    const discoveredClueIds = gameState.value.cluesFound || []
    return estherScript.clues.filter(clue =>
      discoveredClueIds.includes(clue.id)
    )
  })

  // 初始化游戏服务
  const initializeGame = async (serverUrl?: string) => {
    if (isConnecting.value) return

    try {
      isConnecting.value = true
      error.value = null

      gameService.value = new GameService()
      await gameService.value.initialize(serverUrl)

      isConnected.value = true
      console.log('[GameStore] Game service initialized')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败'
      console.error('[GameStore] Failed to initialize game service:', err)
      throw err
    } finally {
      isConnecting.value = false
    }
  }

  // 创建房间
  const createRoom = async (playerName: string, maxPlayers: number, password?: string) => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      const roomId = await gameService.value.createRoom(playerName, maxPlayers, password)

      // 设置当前玩家为房主
      currentPlayer.value = {
        id: 'host', // 实际应该从服务器获取
        name: playerName,
        isHost: true,
        status: 'online',
        characterId: undefined,
        isReady: true,
        avatar: '/images/avatars/host.jpg'
      }

      // 更新房间信息
      currentRoom.value = gameService.value.getCurrentRoom()
      gameState.value = gameService.value.getCurrentGameState()

      return roomId
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建房间失败'
      throw err
    }
  }

  // 加入房间
  const joinRoom = async (roomId: string, playerName: string, password?: string) => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      await gameService.value.joinRoom(roomId, playerName, password)

      // 设置当前玩家
      currentPlayer.value = {
        id: 'player', // 实际应该从服务器获取
        name: playerName,
        isHost: false,
        status: 'online',
        characterId: undefined,
        isReady: false,
        avatar: '/images/avatars/player.jpg'
      }

      // 更新房间信息
      currentRoom.value = gameService.value.getCurrentRoom()
      gameState.value = gameService.value.getCurrentGameState()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加入房间失败'
      throw err
    }
  }

  // 离开房间
  const leaveRoom = async () => {
    if (!gameService.value) return

    try {
      await gameService.value.leaveRoom()

      // 重置状态
      currentRoom.value = null
      currentPlayer.value = null
      gameState.value = null
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '离开房间失败'
      console.error('[GameStore] Failed to leave room:', err)
    }
  }

  // 开始游戏
  const startGame = async () => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      await gameService.value.startGame()

      // 分配角色（这里应该由服务器分配）
      assignCharacters()

      // 更新游戏状态
      gameState.value = gameService.value.getCurrentGameState()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始游戏失败'
      throw err
    }
  }

  // 分配角色
  const assignCharacters = () => {
    if (!gameState.value) return

    const availableCharacters = [...estherScript.characters]
    const shuffled = availableCharacters.sort(() => Math.random() - 0.5)

    gameState.value.players = gameState.value.players.map((player, index) => {
      if (index < shuffled.length) {
        const character = shuffled[index]
        return {
          ...player,
          characterId: character.id,
          character
        }
      }
      return player
    })

    // 更新当前玩家的角色
    const myPlayer = gameState.value.players.find(p => p.id === currentPlayer.value?.id)
    if (myPlayer) {
      currentPlayer.value = myPlayer
    }
  }

  // 进入下一阶段
  const nextPhase = async () => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      await gameService.value.nextPhase()

      // 更新游戏状态
      gameState.value = gameService.value.getCurrentGameState()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '切换阶段失败'
      throw err
    }
  }

  // 发现线索
  const discoverClue = async (clueId: string) => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      await gameService.value.submitClue(clueId)

      // 更新游戏状态
      gameState.value = gameService.value.getCurrentGameState()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发现线索失败'
      throw err
    }
  }

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!gameService.value || !currentRoom.value) {
      throw new Error('游戏服务未初始化或不在房间中')
    }

    try {
      await gameService.value.sendMessage(currentRoom.value.id, content)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
      throw err
    }
  }

  // 投票
  const vote = async (targetPlayerId: string) => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      error.value = null
      await gameService.value.vote(targetPlayerId)

      // 更新游戏状态
      gameState.value = gameService.value.getCurrentGameState()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '投票失败'
      throw err
    }
  }

  // 设置玩家准备状态
  const setPlayerReady = (ready: boolean) => {
    if (currentPlayer.value) {
      currentPlayer.value.isReady = ready
    }
  }

  // 获取房间列表
  const getRoomList = async () => {
    if (!gameService.value) {
      throw new Error('游戏服务未初始化')
    }

    try {
      return await gameService.value.getRoomList()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取房间列表失败'
      throw err
    }
  }

  // 断开连接
  const disconnect = () => {
    if (gameService.value) {
      gameService.value.disconnect()
      gameService.value = null
    }

    // 重置所有状态
    isConnected.value = false
    currentRoom.value = null
    currentPlayer.value = null
    gameState.value = null
    error.value = null
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    isConnected,
    isConnecting,
    currentRoom,
    currentPlayer,
    gameState,
    error,

    // 计算属性
    isHost,
    isGameStarted,
    canStartGame,
    currentPhaseInfo,
    myCharacter,
    availableClues,
    myDiscoveredClues,

    // 方法
    initializeGame,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    nextPhase,
    discoverClue,
    sendMessage,
    vote,
    setPlayerReady,
    getRoomList,
    disconnect,
    clearError
  }
})