<template>
  <div class="player-list">
    <div class="list-header">
      <h3>玩家列表</h3>
      <van-button size="small" @click="$emit('close')">关闭</van-button>
    </div>

    <div class="list-content">
      <div class="players-grid">
        <div
          v-for="player in players"
          :key="player.id"
          class="player-card"
          :class="{ dead: !player.isAlive, host: player.isHost }"
        >
          <div class="player-avatar">
            <img :src="player.avatar || '/images/default-avatar.png'" :alt="player.name" />
            <div class="player-status" :class="player.status"></div>
            <div v-if="player.isHost" class="host-badge">
              <van-icon name="star" color="#ffd21e" size="16" />
            </div>
          </div>
          <div class="player-info">
            <h4 class="player-name">{{ player.name }}</h4>
            <p class="player-character" v-if="player.character">
              {{ player.character.name }}
            </p>
            <p class="player-status-text" v-else>
              未分配角色
            </p>
          </div>
        </div>
      </div>

      <div v-if="players.length === 0" class="empty-list">
        <van-empty description="暂无玩家" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtendedPlayer } from '@/services/game-service'

interface Props {
  players: ExtendedPlayer[]
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped lang="scss">
.player-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
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

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.player-card {
  background: $bg-primary;
  border-radius: $border-radius;
  box-shadow: $box-shadow-sm;
  padding: $spacing-md;
  text-align: center;
  transition: all 0.3s ease;

  &.dead {
    opacity: 0.6;
    background: $bg-secondary;
  }

  &.host {
    border: 2px solid $warning-color;
  }
}

.player-avatar {
  position: relative;
  margin-bottom: $spacing-sm;
  display: inline-block;

  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid $border-color;
  }

  .player-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid $bg-primary;

    &.online {
      background-color: $success-color;
    }

    &.offline {
      background-color: $text-secondary;
    }
  }

  .host-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: $bg-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.player-info {
  .player-name {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  .player-character {
    font-size: $font-size-sm;
    color: $primary-color;
    margin-bottom: 0;
  }

  .player-status-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: 0;
  }
}

.empty-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 移动端适配
@media (max-width: $mobile-breakpoint) {
  .players-grid {
    grid-template-columns: 1fr;
  }

  .player-avatar img {
    width: 48px;
    height: 48px;
  }
}
</style>