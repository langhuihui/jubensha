<template>
  <div class="room-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="游戏房间"
      left-arrow
      @click-left="leaveRoom"
      class="nav-bar"
    >
      <template #right>
        <van-button size="small" @click="showRoomSettings = true">
          <van-icon name="setting-o" />
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 房间信息 -->
    <div class="room-info">
      <div class="room-header">
        <h2 class="room-name">{{ room.name }}</h2>
        <van-tag :type="room.status === 'waiting' ? 'primary' : 'success'">
          {{ room.status === 'waiting' ? '等待中' : '游戏中' }}
        </van-tag>
      </div>
      <div class="room-details">
        <p class="room-id">房间号: {{ roomId }}</p>
        <p class="script-name">{{ room.scriptTitle }}</p>
      </div>
    </div>

    <!-- 玩家列表 -->
    <div class="players-section">
      <h3 class="section-title">
        玩家列表 ({{ room.players.length }}/{{ room.maxPlayers }})
      </h3>
      <div class="players-grid">
        <div
          v-for="player in room.players"
          :key="player.id"
          class="player-item"
        >
          <div class="player-avatar">
            <img
              :src="player.avatar || '/images/default-avatar.png'"
              :alt="player.name"
            />
            <div class="player-status" :class="player.status"></div>
          </div>
          <div class="player-info">
            <p class="player-name">{{ player.name }}</p>
            <p class="player-role" v-if="player.isHost">房主</p>
            <p class="player-role" v-else-if="player.characterId">
              {{ getCharacterName(player.characterId) }}
            </p>
            <p class="player-role" v-else>未分配角色</p>
          </div>
        </div>

        <!-- 空位 -->
        <div
          v-for="i in room.maxPlayers - room.players.length"
          :key="`empty-${i}`"
          class="player-item empty"
        >
          <div class="empty-slot">
            <van-icon name="plus" size="24" />
            <span>等待加入</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏介绍 -->
    <div class="game-intro">
      <h3 class="section-title">游戏介绍</h3>
      <div class="intro-content">
        <p>{{ estherScript.description }}</p>
        <div class="game-stats">
          <div class="stat-item">
            <van-icon name="clock-o" size="16" />
            <span>{{ estherScript.estimatedTime }}分钟</span>
          </div>
          <div class="stat-item">
            <van-icon name="friends-o" size="16" />
            <span>{{ estherScript.minPlayers }}-{{ estherScript.maxPlayers }}人</span>
          </div>
          <div class="stat-item">
            <van-icon name="star-o" size="16" />
            <span>{{ getDifficultyText(estherScript.difficulty) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-section">
      <h3 class="section-title">房间聊天</h3>
      <div class="chat-messages" ref="chatMessagesRef">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'own-message': message.playerId === currentPlayer.id }"
        >
          <div class="message-avatar" v-if="message.playerId !== 'system'">
            <img
              :src="getPlayerAvatar(message.playerId)"
              :alt="message.playerName"
            />
          </div>
          <div class="message-content">
            <div class="message-header" v-if="message.playerId !== 'system'">
              <span class="message-name">{{ message.playerName }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <van-field
          v-model="messageText"
          placeholder="输入消息..."
          maxlength="100"
          @keyup.enter="sendMessage"
        >
          <template #button>
            <van-button size="small" type="primary" @click="sendMessage">
              发送
            </van-button>
          </template>
        </van-field>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <van-button
        v-if="isHost"
        type="primary"
        size="large"
        block
        :disabled="!canStartGame"
        @click="startGame"
      >
        <van-icon name="play" />
        开始游戏
      </van-button>
      <van-button
        v-else
        type="default"
        size="large"
        block
        :disabled="room.status !== 'waiting'"
        @click="showReadyDialog = true"
      >
        <van-icon name="success" />
        {{ isReady ? '取消准备' : '准备' }}
      </van-button>
    </div>

    <!-- 房间设置弹窗 -->
    <van-popup v-model:show="showRoomSettings" position="bottom" :style="{ height: '50%' }">
      <div class="popup-header">
        <h3>房间设置</h3>
        <van-button type="default" size="small" @click="showRoomSettings = false">
          关闭
        </van-button>
      </div>
      <div class="popup-content">
        <van-field name="maxPlayers" label="最大人数" :disabled="!isHost">
          <template #input>
            <van-stepper v-model="tempMaxPlayers" min="4" max="6" :disabled="!isHost" />
          </template>
        </van-field>
        <van-field name="password" label="房间密码" :disabled="!isHost">
          <template #input>
            <van-switch v-model="tempHasPassword" :disabled="!isHost" />
          </template>
        </van-field>
        <van-field
          v-if="tempHasPassword"
          v-model="tempPassword"
          type="password"
          label="密码"
          placeholder="设置房间密码"
          :disabled="!isHost"
          maxlength="20"
        />
        <div class="form-actions" v-if="isHost">
          <van-button type="primary" block @click="saveRoomSettings">
            保存设置
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 准备对话框 -->
    <van-dialog
      v-model:show="showReadyDialog"
      :title="isReady ? '取消准备' : '准备游戏'"
      show-cancel-button
      @confirm="toggleReady"
    >
      <div class="ready-dialog-content">
        <p>{{ isReady ? '确定要取消准备吗？' : '确定要准备游戏吗？' }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { estherScript } from '@/data/esther-script'
import { useGameStore } from '@/stores/game'

interface Player {
  id: string
  name: string
  avatar: string
  isHost: boolean
  characterId?: string
  status: 'online' | 'offline'
  isReady: boolean
}

interface Room {
  id: string
  name: string
  status: 'waiting' | 'playing' | 'ended'
  players: Player[]
  maxPlayers: number
  scriptTitle: string
  hasPassword: boolean
  hostId: string
}

interface Message {
  id: string
  playerId: string
  playerName: string
  content: string
  timestamp: number
}

const router = useRouter()
const route = useRoute()
const roomId = route.params.roomId as string
const playerName = route.query.playerName as string || '玩家'
const isHostQuery = route.query.isHost === 'true'
const gameStore = useGameStore()

// 房间数据
const room = ref<Room>({
  id: roomId,
  name: '波斯皇宫',
  status: 'waiting',
  players: [],
  maxPlayers: 6,
  scriptTitle: estherScript.title,
  hasPassword: false,
  hostId: ''
})

// 当前玩家
const currentPlayer = ref<Player>({
  id: '',
  name: playerName,
  avatar: '/images/avatars/default.svg',
  isHost: isHostQuery,
  status: 'online',
  isReady: isHostQuery
})

// 监听游戏状态变化
watch(() => gameStore.currentRoom, (newRoom) => {
  if (newRoom) {
    room.value = {
      ...room.value,
      id: newRoom.id,
      maxPlayers: newRoom.maxPlayers,
      hostId: newRoom.hostId,
      status: newRoom.status || 'waiting'
    }
    // Also sync players from room if available
    if (newRoom.players && newRoom.players.length > 0) {
      room.value.players = newRoom.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || '/images/avatars/default.svg',
        isHost: p.isHost,
        status: p.status || 'online',
        isReady: p.isReady || false,
        characterId: p.characterId
      }))
    }
  }
}, { deep: true })

watch(() => gameStore.gameState, (newState) => {
  if (newState && newState.players) {
    room.value.players = newState.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '/images/avatars/default.svg',
      isHost: p.isHost,
      status: p.status || 'online',
      isReady: p.isReady || false,
      characterId: p.characterId
    }))
  }
}, { deep: true })

// 聊天消息 - 从gameStore获取
const messages = computed(() => {
  // 将gameStore的gameLog转换为Message格式
  const gameLogMessages = gameStore.gameLog
    .filter((log: any) => log.type === 'message')
    .map((log: any) => ({
      id: log.timestamp.toString(),
      playerId: log.playerId || 'unknown',
      playerName: log.content.split(':')[0] || '未知玩家',
      content: log.content.split(':').slice(1).join(':') || log.content,
      timestamp: log.timestamp
    }))

  // 添加系统欢迎消息
  return [
    {
      id: 'welcome',
      playerId: 'system',
      playerName: '系统',
      content: '欢迎来到游戏房间！',
      timestamp: Date.now() - 60000
    },
    ...gameLogMessages
  ]
})

const messageText = ref('')
const chatMessagesRef = ref<HTMLElement>()

// 弹窗状态
const showRoomSettings = ref(false)
const showReadyDialog = ref(false)

// 房间设置临时变量
const tempMaxPlayers = ref(6)
const tempHasPassword = ref(false)
const tempPassword = ref('')

// 计算属性
const isHost = computed(() => currentPlayer.value.id === room.value.hostId)
const isReady = computed(() => currentPlayer.value.isReady)
const canStartGame = computed(() => {
  return room.value.players.length >= estherScript.minPlayers &&
         room.value.players.every(p => p.isReady || p.isHost) &&
         room.value.status === 'waiting'
})

// 方法
const getCharacterName = (characterId: string) => {
  const character = estherScript.characters.find(c => c.id === characterId)
  return character?.name || '未知角色'
}

const getDifficultyText = (difficulty: string) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty as keyof typeof map] || '未知'
}

const getPlayerAvatar = (playerId: string) => {
  const player = room.value.players.find(p => p.id === playerId)
  return player?.avatar || '/images/default-avatar.png'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const sendMessage = async () => {
  if (!messageText.value.trim()) return

  const content = messageText.value.trim()

  try {
    // 发送消息到服务器（gameStore.sendMessage会自动处理roomId）
    await gameStore.sendMessage(content)

    // 清空输入框
    messageText.value = ''

    // 滚动到底部
    await nextTick()
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    showToast('消息发送失败')
  }
}

const leaveRoom = async () => {
  try {
    await showConfirmDialog({
      title: '离开房间',
      message: '确定要离开房间吗？',
    })

    showLoadingToast({
      message: '正在离开房间...',
      forbidClick: true
    })

    // TODO: 调用SDK离开房间API
    // await gameClient.room.leaveRoom()

    await new Promise(resolve => setTimeout(resolve, 500))

    closeToast()
    router.push('/lobby')
  } catch (error) {
    // 用户取消或其他错误
  }
}

const startGame = async () => {
  if (!canStartGame.value) {
    showToast('条件不满足，无法开始游戏')
    return
  }

  try {
    await showConfirmDialog({
      title: '开始游戏',
      message: '确定要开始游戏吗？',
    })

    showLoadingToast({
      message: '正在开始游戏...',
      forbidClick: true
    })

    // TODO: 调用SDK开始游戏API
    // await gameClient.game.startGame()

    // 分配角色
    assignCharacters()

    await new Promise(resolve => setTimeout(resolve, 1000))

    closeToast()
    showToast('游戏开始！')

    // 跳转到游戏页面
    router.push({
      name: 'Game',
      params: { roomId }
    })
  } catch (error) {
    // 用户取消或其他错误
  }
}

const assignCharacters = () => {
  const availableCharacters = [...estherScript.characters]
  const shuffled = availableCharacters.sort(() => Math.random() - 0.5)

  room.value.players.forEach((player, index) => {
    if (index < shuffled.length) {
      player.characterId = shuffled[index].id
    }
  })
}

const saveRoomSettings = () => {
  room.value.maxPlayers = tempMaxPlayers.value
  room.value.hasPassword = tempHasPassword.value

  showToast('设置保存成功')
  showRoomSettings.value = false
}

const toggleReady = () => {
  currentPlayer.value.isReady = !currentPlayer.value.isReady

  // 更新房间玩家列表中的准备状态
  const playerIndex = room.value.players.findIndex(p => p.id === currentPlayer.value.id)
  if (playerIndex !== -1) {
    room.value.players[playerIndex].isReady = currentPlayer.value.isReady
  }

  showToast(currentPlayer.value.isReady ? '已准备' : '已取消准备')
}

// 初始化房间
onMounted(async () => {
  // 从游戏store获取房间和玩家信息
  const storeRoom = gameStore.currentRoom
  const storePlayer = gameStore.currentPlayer

  if (storeRoom) {
    room.value = {
      ...room.value,
      id: storeRoom.id,
      maxPlayers: storeRoom.maxPlayers,
      hostId: storeRoom.hostId,
      status: storeRoom.status || 'waiting'
    }
    // Also sync players from store room
    if (storeRoom.players && storeRoom.players.length > 0) {
      room.value.players = storeRoom.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || '/images/avatars/default.svg',
        isHost: p.isHost,
        status: p.status || 'online',
        isReady: p.isReady || false,
        characterId: p.characterId
      }))
    }
  }

  if (storePlayer) {
    currentPlayer.value = {
      id: storePlayer.id,
      name: storePlayer.name,
      avatar: storePlayer.avatar || '/images/avatars/default.svg',
      isHost: storePlayer.isHost,
      status: storePlayer.status || 'online',
      isReady: storePlayer.isReady || false
    }
  }

  // 添加当前玩家到房间玩家列表
  if (currentPlayer.value.id && !room.value.players.find(p => p.id === currentPlayer.value.id)) {
    room.value.players.push(currentPlayer.value)
  }

  // 如果没有玩家列表，至少添加当前玩家
  if (room.value.players.length === 0) {
    currentPlayer.value.id = currentPlayer.value.id || `player_${Date.now()}`
    room.value.players.push(currentPlayer.value)
    if (isHostQuery) {
      room.value.hostId = currentPlayer.value.id
    }
  }

  // 模拟房间设置
  tempMaxPlayers.value = room.value.maxPlayers
  tempHasPassword.value = room.value.hasPassword
})

onUnmounted(() => {
  // 离开房间时可以清理资源
})
</script>

<style scoped lang="scss">
.room-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: $bg-secondary;
}

.nav-bar {
  flex-shrink: 0;
}

.room-info {
  padding: $spacing-md;
  background: $bg-primary;
  border-bottom: 1px solid $border-color;

  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;

    .room-name {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .room-details {
    p {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: $spacing-xs;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.players-section {
  padding: $spacing-md;
  flex-shrink: 0;

  .section-title {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;

  .player-item {
    background: $bg-primary;
    border-radius: $border-radius;
    padding: $spacing-sm;
    text-align: center;

    &.empty {
      .empty-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-xs;
        color: $text-secondary;
        font-size: $font-size-xs;

        .van-icon {
          color: $text-secondary;
        }
      }
    }
  }

  .player-avatar {
    position: relative;
    margin-bottom: $spacing-xs;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .player-status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid $bg-primary;

      &.online {
        background-color: $success-color;
      }

      &.offline {
        background-color: $text-secondary;
      }
    }
  }

  .player-info {
    .player-name {
      font-size: $font-size-xs;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .player-role {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.game-intro {
  padding: $spacing-md;
  background: $bg-primary;
  border-top: 1px solid $border-color;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;

  .section-title {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .intro-content {
    p {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.5;
      margin-bottom: $spacing-sm;
    }

    .game-stats {
      display: flex;
      gap: $spacing-md;

      .stat-item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
  }
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-md;
  min-height: 200px;

  .section-title {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    flex-shrink: 0;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-primary;
    border-radius: $border-radius;
    min-height: 100px;
  }

  .message-item {
    display: flex;
    margin-bottom: $spacing-sm;

    &.own-message {
      flex-direction: row-reverse;

      .message-content {
        text-align: right;

        .message-header {
          flex-direction: row-reverse;
        }
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;
    margin-right: $spacing-sm;

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .message-content {
    flex: 1;

    .message-header {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin-bottom: $spacing-xs;

      .message-name {
        font-size: $font-size-xs;
        font-weight: bold;
        color: $text-primary;
      }

      .message-time {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .message-text {
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.4;
      background: $bg-secondary;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      display: inline-block;
      max-width: 100%;
    }
  }
}

.chat-input {
  flex-shrink: 0;
}

.bottom-actions {
  padding: $spacing-md;
  background: $bg-primary;
  border-top: 1px solid $border-color;
  flex-shrink: 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;

  h3 {
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.popup-content {
  padding: $spacing-lg;

  .form-actions {
    margin-top: $spacing-xl;
  }
}

.ready-dialog-content {
  padding: $spacing-lg;
  text-align: center;

  p {
    font-size: $font-size-md;
    color: $text-primary;
    margin: 0;
  }
}
</style>