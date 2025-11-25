<template>
  <div class="game-container">
    <!-- 游戏头部 -->
    <div class="game-header">
      <div class="phase-info">
        <h3>{{ currentPhaseInfo?.name || '游戏准备中' }}</h3>
        <p class="phase-description">{{ currentPhaseInfo?.description }}</p>
      </div>
      <div class="timer" v-if="phaseTimeLeft > 0">
        <van-icon name="clock-o" />
        <span>{{ formatTime(phaseTimeLeft) }}</span>
      </div>
    </div>

    <!-- 游戏内容区域 -->
    <div class="game-content">
      <!-- 角色介绍阶段 -->
      <div v-if="currentPhase === 'character_introduction'" class="phase-content">
        <CharacterIntro :character="myCharacter" />
      </div>

      <!-- 宫廷生活阶段 -->
      <div v-else-if="currentPhase === 'palace_life'" class="phase-content">
        <PalaceLife
          :clues="availableClues"
          :discovered-clues="myDiscoveredClues"
          @discover-clue="discoverClue"
        />
      </div>

      <!-- 危机降临阶段 -->
      <div v-else-if="currentPhase === 'crisis_emerges'" class="phase-content">
        <CrisisPhase
          :character="myCharacter"
          :clues="myDiscoveredClues"
          @next-phase="nextPhase"
        />
      </div>

      <!-- 王后抉择阶段 -->
      <div v-else-if="currentPhase === 'queen_decision'" class="phase-content">
        <QueenDecision
          :character="myCharacter"
          :is-host="isHost"
          @make-decision="makeDecision"
        />
      </div>

      <!-- 御前宴会阶段 -->
      <div v-else-if="currentPhase === 'royal_banquet'" class="phase-content">
        <RoyalBanquet
          :character="myCharacter"
          :players="gameState?.players"
          :clues="myDiscoveredClues"
          @present-evidence="presentEvidence"
        />
      </div>

      <!-- 最终审判阶段 -->
      <div v-else-if="currentPhase === 'final_judgment'" class="phase-content">
        <FinalJudgment
          :character="myCharacter"
          :players="gameState?.players"
          :votes="gameState?.votes"
          @vote="castVote"
        />
      </div>

      <!-- 游戏结束 -->
      <div v-else-if="gameState?.isEnded" class="phase-content">
        <GameEnd
          :winner="gameState.winner"
          :players="gameState.players"
          @back-to-lobby="backToLobby"
        />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="game-footer" v-if="!gameState?.isEnded">
      <div class="action-buttons">
        <van-button
          v-if="isHost && canAdvancePhase"
          type="primary"
          @click="nextPhase"
        >
          进入下一阶段
        </van-button>

        <van-button
          v-if="myCharacter && !gameState?.isEnded"
          type="default"
          @click="showCharacterCard = true"
        >
          我的角色
        </van-button>

        <van-button
          type="default"
          @click="showGameLog = true"
        >
          游戏记录
        </van-button>

        <van-button
          type="default"
          @click="showPlayerList = true"
        >
          玩家列表
        </van-button>
      </div>
    </div>

    <!-- 角色卡片弹窗 -->
    <van-popup v-model:show="showCharacterCard" position="bottom" :style="{ height: '80%' }">
      <CharacterCard :character="myCharacter" v-if="myCharacter" />
    </van-popup>

    <!-- 游戏记录弹窗 -->
    <van-popup v-model:show="showGameLog" position="bottom" :style="{ height: '60%' }">
      <GameLog :logs="gameState?.gameLog || []" />
    </van-popup>

    <!-- 玩家列表弹窗 -->
    <van-popup v-model:show="showPlayerList" position="bottom" :style="{ height: '50%' }">
      <PlayerList :players="gameState?.players || []" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useGameStore } from '@/stores/game'
import CharacterIntro from '@/components/game/CharacterIntro.vue'
import PalaceLife from '@/components/game/PalaceLife.vue'
import CrisisPhase from '@/components/game/CrisisPhase.vue'
import QueenDecision from '@/components/game/QueenDecision.vue'
import RoyalBanquet from '@/components/game/RoyalBanquet.vue'
import FinalJudgment from '@/components/game/FinalJudgment.vue'
import GameEnd from '@/components/game/GameEnd.vue'
import CharacterCard from '@/components/game/CharacterCard.vue'
import GameLog from '@/components/game/GameLog.vue'
import PlayerList from '@/components/game/PlayerList.vue'
import { GAME_CONFIG } from '@/data/game-config'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

// 弹窗状态
const showCharacterCard = ref(false)
const showGameLog = ref(false)
const showPlayerList = ref(false)

// 计时器
const phaseTimeLeft = ref(0)
let timerInterval: NodeJS.Timeout | null = null

// 计算属性
const currentPhase = computed(() => gameStore.gameState?.phase || '')
const currentPhaseInfo = computed(() => gameStore.currentPhaseInfo)
const myCharacter = computed(() => gameStore.myCharacter)
const gameState = computed(() => gameStore.gameState)
const isHost = computed(() => gameStore.isHost)
const canAdvancePhase = computed(() => {
  if (!isHost.value || !gameState.value) return false

  // 检查是否所有玩家都完成了当前阶段
  return gameState.value.players.every(player =>
    player.isHost || hasPlayerCompletedPhase(player)
  )
})

// 检查玩家是否完成当前阶段
const hasPlayerCompletedPhase = (player: any): boolean => {
  // 这里可以根据不同阶段实现不同的完成逻辑
  return true // 暂时返回true
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 启动阶段计时器
const startPhaseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  const phaseDuration = currentPhaseInfo.value?.duration || 0
  phaseTimeLeft.value = phaseDuration * 60 // 转换为秒

  timerInterval = setInterval(() => {
    phaseTimeLeft.value--
    if (phaseTimeLeft.value <= 0) {
      clearInterval(timerInterval)
      if (isHost.value) {
        nextPhase()
      }
    }
  }, 1000)
}

// 发现线索
const discoverClue = async (clueId: string) => {
  try {
    await gameStore.discoverClue(clueId)
    showToast('发现新线索！')
  } catch (error) {
    showToast('发现线索失败')
    console.error('Discover clue error:', error)
  }
}

// 进入下一阶段
const nextPhase = async () => {
  try {
    await gameStore.nextPhase()
    showToast('进入下一阶段')
    startPhaseTimer()
  } catch (error) {
    showToast('切换阶段失败')
    console.error('Next phase error:', error)
  }
}

// 做出决定（王后抉择阶段）
const makeDecision = async (decision: string) => {
  try {
    // 实现决定逻辑
    showToast('已做出决定')
    await nextPhase()
  } catch (error) {
    showToast('操作失败')
    console.error('Make decision error:', error)
  }
}

// 出示证据（御前宴会阶段）
const presentEvidence = async (evidence: string) => {
  try {
    // 实现出示证据逻辑
    showToast('证据已出示')
  } catch (error) {
    showToast('出示证据失败')
    console.error('Present evidence error:', error)
  }
}

// 投票（最终审判阶段）
const castVote = async (targetPlayerId: string) => {
  try {
    await gameStore.vote(targetPlayerId)
    showToast('投票成功')
  } catch (error) {
    showToast('投票失败')
    console.error('Vote error:', error)
  }
}

// 返回大厅
const backToLobby = () => {
  router.push('/lobby')
}

// 页面加载时初始化
onMounted(async () => {
  const roomId = route.params.roomId as string

  try {
    // 检查是否已连接
    if (!gameStore.isConnected) {
      await gameStore.initializeGame()
    }

    // 检查是否在房间中
    if (!gameStore.currentRoom || gameStore.currentRoom.id !== roomId) {
      // 这里需要重新加入房间
      showToast('重新连接游戏...')
    }

    // 启动计时器
    if (currentPhase.value && currentPhase.value !== 'IDLE') {
      startPhaseTimer()
    }
  } catch (error) {
    console.error('Game initialization error:', error)
    showToast('游戏初始化失败')
    router.push('/lobby')
  }
})

// 页面卸载时清理
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped lang="scss">
.game-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: $bg-secondary;
}

.game-header {
  background: $bg-primary;
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;

  .phase-info {
    flex: 1;

    h3 {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .phase-description {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.4;
    }
  }

  .timer {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    color: $warning-color;
    font-weight: bold;
    font-size: $font-size-sm;

    .van-icon {
      font-size: $font-size-md;
    }
  }
}

.game-content {
  flex: 1;
  overflow: hidden;
  position: relative;

  .phase-content {
    height: 100%;
    overflow-y: auto;
    padding: $spacing-md;
  }
}

.game-footer {
  background: $bg-primary;
  border-top: 1px solid $border-color;
  padding: $spacing-md;
  flex-shrink: 0;

  .action-buttons {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;

    .van-button {
      flex: 1;
      min-width: 0;

      &:not(:last-child) {
        margin-right: 0;
      }
    }
  }
}

// 移动端适配
@media (max-width: $mobile-breakpoint) {
  .game-header {
    padding: $spacing-sm;
    flex-direction: column;
    gap: $spacing-sm;

    .phase-info {
      h3 {
        font-size: $font-size-md;
      }
    }

    .timer {
      align-self: flex-end;
    }
  }

  .game-footer {
    .action-buttons {
      .van-button {
        font-size: $font-size-sm;
        padding: $spacing-xs $spacing-sm;
      }
    }
  }
}
</style>