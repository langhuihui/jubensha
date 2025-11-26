<template>
  <div class="character-intro">
    <div class="intro-header">
      <h2>角色介绍</h2>
      <p>请仔细阅读你的角色信息，了解你的背景和目标</p>
    </div>

    <div v-if="character" class="character-card">
      <div class="character-header">
        <div class="character-avatar">
          <img :src="character.avatar" :alt="character.name" />
        </div>
        <div class="character-basic">
          <h3>{{ character.name }}</h3>
          <p class="character-title">{{ character.title }}</p>
        </div>
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
        <h4>你的目标</h4>
        <p>{{ character.goal }}</p>
      </div>

      <div v-if="character.secret" class="character-section secret">
        <h4>秘密信息</h4>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="点击查看你的秘密" name="secret">
            <p>{{ character.secret }}</p>
          </van-collapse-item>
        </van-collapse>
      </div>

      <div v-if="character.skills && character.skills.length > 0" class="character-section">
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

    <div class="intro-actions">
      <van-button
        type="primary"
        size="large"
        block
        @click="confirmIntro"
        :disabled="!confirmed"
      >
        我已了解角色
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Character } from '@/types/game'

interface Props {
  character: Character | null
}

defineProps<Props>()

const emit = defineEmits<{
  introConfirmed: []
}>()

const activeNames = ref<string[]>([])
const confirmed = ref(false)

const confirmIntro = () => {
  confirmed.value = true
  emit('introConfirmed')
}

onMounted(() => {
  // 模拟阅读时间
  setTimeout(() => {
    confirmed.value = true
  }, 10000) // 10秒后允许确认
})
</script>

<style scoped lang="scss">
.character-intro {
  max-width: 600px;
  margin: 0 auto;
  padding: $spacing-md;
}

.intro-header {
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

.character-card {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.character-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;

  .character-avatar {
    flex-shrink: 0;
    margin-right: $spacing-md;

    img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid $primary-color;
    }
  }

  .character-basic {
    flex: 1;

    h3 {
      font-size: $font-size-xl;
      font-weight: bold;
      color: $primary-color;
      margin-bottom: $spacing-xs;
    }

    .character-title {
      font-size: $font-size-md;
      color: $text-secondary;
      font-weight: 500;
    }
  }
}

.character-section {
  margin-bottom: $spacing-lg;

  h4 {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    &::before {
      content: '';
      width: 4px;
      height: 18px;
      background-color: $primary-color;
      border-radius: 2px;
    }
  }

  p {
    font-size: $font-size-md;
    line-height: 1.6;
    color: $text-primary;
    text-align: justify;
  }

  &.secret {
    border: 1px solid $warning-color;
    border-radius: $border-radius;
    padding: $spacing-sm;
    background-color: rgba($warning-color, 0.05);

    h4 {
      color: $warning-color;
    }
  }
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.intro-actions {
  margin-top: $spacing-xl;
}
</style>