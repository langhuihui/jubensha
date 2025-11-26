<template>
  <div class="character-card">
    <div class="card-header">
      <h3>我的角色</h3>
      <van-button size="small" @click="$emit('close')">关闭</van-button>
    </div>

    <div class="card-content" v-if="character">
      <div class="character-avatar">
        <img :src="character.avatar" :alt="character.name" />
      </div>

      <div class="character-info">
        <h2>{{ character.name }}</h2>
        <p class="character-title">{{ character.title }}</p>
      </div>

      <div class="character-section">
        <h4>角色描述</h4>
        <p>{{ character.description }}</p>
      </div>

      <div class="character-section">
        <h4>背景故事</h4>
        <p>{{ character.background }}</p>
      </div>

      <div class="character-section">
        <h4>游戏目标</h4>
        <p>{{ character.goal }}</p>
      </div>

      <div v-if="character.secret" class="character-section secret">
        <h4>秘密信息</h4>
        <p>{{ character.secret }}</p>
      </div>

      <div v-if="character.skills" class="character-section">
        <h4>特殊能力</h4>
        <div class="skills-list">
          <van-tag
            v-for="skill in character.skills"
            :key="skill"
            type="primary"
            size="medium"
          >
            {{ skill }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '@/types/game'

interface Props {
  character: Character
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped lang="scss">
.character-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
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

.card-content {
  flex: 1;
  padding: $spacing-lg;
  overflow-y: auto;
}

.character-avatar {
  text-align: center;
  margin-bottom: $spacing-lg;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid $primary-color;
  }
}

.character-info {
  text-align: center;
  margin-bottom: $spacing-xl;

  h2 {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: $spacing-xs;
  }

  .character-title {
    font-size: $font-size-md;
    color: $text-secondary;
  }
}

.character-section {
  margin-bottom: $spacing-lg;

  h4 {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.6;
  }

  &.secret {
    background: rgba($warning-color, 0.1);
    padding: $spacing-sm;
    border-radius: $border-radius;
    border-left: 4px solid $warning-color;
  }
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}
</style>