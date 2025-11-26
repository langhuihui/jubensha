<template>
  <div class="game-log">
    <div class="log-header">
      <h3>游戏记录</h3>
      <van-button size="small" @click="$emit('close')">关闭</van-button>
    </div>

    <div class="log-content">
      <div class="log-list">
        <div
          v-for="log in logs"
          :key="log.timestamp"
          class="log-item"
          :class="log.type"
        >
          <div class="log-time">
            {{ formatTime(log.timestamp) }}
          </div>
          <div class="log-message">
            {{ log.content }}
          </div>
        </div>
      </div>

      <div v-if="logs.length === 0" class="empty-log">
        <van-empty description="暂无游戏记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface LogEntry {
  timestamp: number
  type: 'system' | 'action' | 'discovery' | 'vote' | 'message'
  content: string
  playerId?: string
}

interface Props {
  logs: LogEntry[]
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}
</script>

<style scoped lang="scss">
.game-log {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-header {
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

.log-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
}

.log-item {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  background: $bg-secondary;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;

  &.system {
    background: rgba($info-color, 0.1);
    border-left: 3px solid $info-color;
  }

  &.discovery {
    background: rgba($success-color, 0.1);
    border-left: 3px solid $success-color;
  }

  &.vote {
    background: rgba($warning-color, 0.1);
    border-left: 3px solid $warning-color;
  }

  &.message {
    background: rgba($primary-color, 0.1);
    border-left: 3px solid $primary-color;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.log-time {
  flex-shrink: 0;
  color: $text-secondary;
  font-size: $font-size-xs;
  min-width: 60px;
}

.log-message {
  flex: 1;
  color: $text-primary;
  line-height: 1.4;
}

.empty-log {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>