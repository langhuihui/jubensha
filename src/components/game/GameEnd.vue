<template>
  <div class="game-end">
    <div class="end-header">
      <h2>游戏结束</h2>
      <p>感谢参与以斯帖记剧本杀游戏！</p>
    </div>

    <div class="result-content">
      <div class="winner-announcement">
        <h3>游戏结果</h3>
        <div class="winner-info">
          <van-icon name="trophy-full" size="48" color="#ffd21e" />
          <h4 v-if="winner">{{ getWinnerText(winner) }}</h4>
          <h4 v-else>游戏结束</h4>
        </div>
      </div>

      <div class="players-summary">
        <h3>角色真相</h3>
        <div class="players-list">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-summary"
          >
            <div class="player-header">
              <img :src="player.avatar" :alt="player.name" />
              <div class="player-info">
                <h4>{{ player.name }}</h4>
                <p>{{ player.character?.name || '未知角色' }}</p>
              </div>
            </div>
            <div class="player-goal">
              <p><strong>目标：</strong>{{ player.character?.goal || '未知' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="story-review">
        <h3>故事回顾</h3>
        <p>以斯帖勇敢地站出来，在国王面前揭露了哈曼的阴谋。最终，哈曼被处死，犹太人获得了拯救。这个事件后来成为犹太人普珥节的由来。</p>
      </div>
    </div>

    <div class="end-actions">
      <van-button
        type="primary"
        size="large"
        block
        @click="backToLobby"
      >
        返回大厅
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  winner?: string
  players: any[]
}

defineProps<Props>()

const emit = defineEmits<{
  backToLobby: []
}>()

const getWinnerText = (winner: string): string => {
  const winnerMap = {
    'esther_win': '以斯帖获胜！犹太人被拯救',
    'haman_win': '哈曼获胜！阴谋成功',
    'neutral_win': '平局'
  }
  return winnerMap[winner as keyof typeof winnerMap] || '游戏结束'
}

const backToLobby = () => {
  emit('backToLobby')
}
</script>

<style scoped lang="scss">
.game-end {
  max-width: 600px;
  margin: 0 auto;
  padding: $spacing-md;
}

.end-header {
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

.result-content {
  .winner-announcement,
  .players-summary,
  .story-review {
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
}

.winner-announcement {
  text-align: center;

  .winner-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;

    h4 {
      font-size: $font-size-xl;
      font-weight: bold;
      color: $text-primary;
    }
  }
}

.players-summary {
  .players-list {
    .player-summary {
      margin-bottom: $spacing-lg;
      padding-bottom: $spacing-lg;
      border-bottom: 1px solid $border-color;

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }
  }

  .player-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-sm;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
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

  .player-goal {
    p {
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.5;
    }
  }
}

.story-review {
  p {
    font-size: $font-size-md;
    color: $text-primary;
    line-height: 1.6;
    text-align: justify;
  }
}

.end-actions {
  margin-top: $spacing-xl;
}
</style>