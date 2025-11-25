<template>
  <div class="final-judgment">
    <div class="phase-header">
      <h2>最终审判</h2>
      <p>投票决定游戏结果，揭示最终的真相</p>
    </div>

    <div class="judgment-content">
      <div class="voting-section">
        <h3>投票环节</h3>
        <p>请选择你认为是反派的角色：</p>

        <div class="players-list">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-option"
            @click="voteForPlayer(player.id)"
            :class="{ selected: selectedPlayer === player.id }"
          >
            <div class="player-avatar">
              <img :src="player.avatar" :alt="player.name" />
            </div>
            <div class="player-info">
              <h4>{{ player.name }}</h4>
              <p>{{ player.character?.name || '未知角色' }}</p>
            </div>
            <van-icon
              v-if="selectedPlayer === player.id"
              name="success"
              color="#07c160"
              size="24"
            />
          </div>
        </div>

        <div class="vote-action">
          <van-button
            type="primary"
            size="large"
            block
            @click="submitVote"
            :disabled="!selectedPlayer"
          >
            确认投票
          </van-button>
        </div>
      </div>

      <div v-if="votes" class="current-votes">
        <h3>当前投票情况</h3>
        <div class="votes-display">
          <div
            v-for="(count, playerId) in voteCounts"
            :key="playerId"
            class="vote-item"
          >
            <span class="player-name">{{ getPlayerName(playerId) }}</span>
            <span class="vote-count">{{ count }} 票</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import type { Character } from '@/types/game'

interface Props {
  character: Character | null
  players: any[]
  votes: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  vote: [targetPlayerId: string]
}>()

const selectedPlayer = ref('')

const voteCounts = computed(() => {
  const counts: Record<string, number> = {}

  Object.values(props.votes).forEach(targetId => {
    counts[targetId] = (counts[targetId] || 0) + 1
  })

  return counts
})

const voteForPlayer = (playerId: string) => {
  selectedPlayer.value = playerId
}

const submitVote = () => {
  if (!selectedPlayer.value) return

  emit('vote', selectedPlayer.value)
  showToast('投票成功')
}

const getPlayerName = (playerId: string): string => {
  const player = props.players.find(p => p.id === playerId)
  return player?.character?.name || player?.name || '未知玩家'
}
</script>

<style scoped lang="scss">
.final-judgment {
  max-width: 600px;
  margin: 0 auto;
  padding: $spacing-md;
}

.phase-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  h2 {
    font-size: $font-size-xl;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-md;
    color: $text-secondary;
  }
}

.judgment-content {
  .voting-section,
  .current-votes {
    background: $bg-primary;
    border-radius: $border-radius;
    box-shadow: $box-shadow-sm;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: $font-size-md;
    color: $text-primary;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
  }
}

.players-list {
  .player-option {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-secondary;
    border-radius: $border-radius;
    margin-bottom: $spacing-sm;
    cursor: pointer;
    transition: all 0.3s ease;

    &.selected {
      background: rgba($primary-color, 0.1);
      border: 2px solid $primary-color;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .player-avatar {
    flex-shrink: 0;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .player-info {
    flex: 1;

    h4 {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    p {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: 0;
    }
  }
}

.vote-action {
  margin-top: $spacing-lg;
}

.current-votes {
  .votes-display {
    .vote-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-sm 0;
      border-bottom: 1px solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .player-name {
        font-size: $font-size-md;
        color: $text-primary;
      }

      .vote-count {
        font-size: $font-size-md;
        font-weight: bold;
        color: $primary-color;
      }
    }
  }
}
</style>