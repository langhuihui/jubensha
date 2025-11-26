<template>
  <div class="palace-life">
    <div class="phase-header">
      <h2>宫廷生活</h2>
      <p>探索波斯皇宫，寻找线索，了解其他角色的信息</p>
    </div>

    <div class="clues-section">
      <h3>线索收集</h3>
      <div class="clues-grid">
        <div
          v-for="clue in clues"
          :key="clue.id"
          class="clue-item"
          @click="discoverClue(clue.id)"
        >
          <div class="clue-icon">
            {{ clue.icon }}
          </div>
          <div class="clue-info">
            <h4>{{ clue.name }}</h4>
            <p>{{ clue.description }}</p>
          </div>
          <div class="clue-type">
            <van-tag :type="getClueTypeColor(clue.type) as any" size="medium">
              {{ getClueTypeName(clue.type) }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <div v-if="discoveredClues.length > 0" class="discovered-section">
      <h3>已发现线索</h3>
      <div class="discovered-list">
        <div
          v-for="clue in discoveredClues"
          :key="clue.id"
          class="discovered-item"
          @click="viewClueDetail(clue)"
        >
          <div class="clue-icon discovered">
            {{ clue.icon }}
          </div>
          <div class="clue-info">
            <h4>{{ clue.name }}</h4>
            <p>{{ clue.content || clue.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 线索详情弹窗 -->
    <van-popup v-model:show="showClueDetail" position="bottom" :style="{ height: '60%' }">
      <div class="clue-detail-popup" v-if="selectedClue">
        <div class="popup-header">
          <h3>{{ selectedClue.name }}</h3>
          <van-button size="small" @click="showClueDetail = false">关闭</van-button>
        </div>
        <div class="popup-content">
          <div class="clue-detail-content">
            <div class="clue-meta">
              <van-tag :type="getClueTypeColor(selectedClue.type) as any">
                {{ getClueTypeName(selectedClue.type) }}
              </van-tag>
            </div>
            <div class="clue-description">
              <p>{{ selectedClue.description }}</p>
            </div>
            <div v-if="selectedClue.content" class="clue-content">
              <h4>详细内容</h4>
              <p>{{ selectedClue.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import type { Clue } from '@/types/game'
import { CLUE_TYPES } from '@/data/game-config'

interface Props {
  clues: Clue[]
  discoveredClues: Clue[]
}

defineProps<Props>()

const emit = defineEmits<{
  discoverClue: [clueId: string]
}>()

const showClueDetail = ref(false)
const selectedClue = ref<Clue | null>(null)

const discoverClue = (clueId: string) => {
  emit('discoverClue', clueId)
  showToast('发现新线索！')
}

const viewClueDetail = (clue: Clue) => {
  selectedClue.value = clue
  showClueDetail.value = true
}

const getClueTypeName = (type: string): string => {
  return CLUE_TYPES[type as keyof typeof CLUE_TYPES]?.name || type
}

const getClueTypeColor = (type: string): string => {
  const colorMap = {
    document: 'primary',
    testimony: 'success',
    object: 'warning',
    scene: 'danger'
  }
  return colorMap[type as keyof typeof colorMap] || 'default'
}
</script>

<style scoped lang="scss">
.palace-life {
  max-width: 800px;
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

.clues-section {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.clues-grid {
  display: grid;
  gap: $spacing-md;

  .clue-item {
    background: $bg-primary;
    border-radius: $border-radius;
    box-shadow: $box-shadow-sm;
    padding: $spacing-md;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $box-shadow;
      transform: translateY(-2px);
    }
  }

  .clue-icon {
    flex-shrink: 0;
    font-size: $font-size-xxl;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border-radius: $border-radius;
  }

  .clue-info {
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
      line-height: 1.4;
    }
  }

  .clue-type {
    flex-shrink: 0;
  }
}

.discovered-section {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.discovered-list {
  .discovered-item {
    background: $bg-primary;
    border-radius: $border-radius;
    box-shadow: $box-shadow-sm;
    padding: $spacing-md;
    margin-bottom: $spacing-sm;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    .clue-icon {
      &.discovered {
        background: rgba($success-color, 0.1);
        color: $success-color;
      }
    }

    .clue-info {
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
        line-height: 1.4;
      }
    }
  }
}

.clue-detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
}

.clue-detail-content {
  .clue-meta {
    margin-bottom: $spacing-md;
  }

  .clue-description {
    margin-bottom: $spacing-lg;

    p {
      font-size: $font-size-md;
      color: $text-primary;
      line-height: 1.6;
    }
  }

  .clue-content {
    h4 {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    p {
      font-size: $font-size-md;
      color: $text-primary;
      line-height: 1.6;
      background: $bg-secondary;
      padding: $spacing-md;
      border-radius: $border-radius;
      border-left: 4px solid $primary-color;
    }
  }
}
</style>