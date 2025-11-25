<template>
  <div class="royal-banquet">
    <div class="phase-header">
      <h2>御前宴会</h2>
      <p>关键时刻到了！在国王和哈曼面前，以斯帖将揭露真相</p>
    </div>

    <div class="banquet-scene">
      <h3>宴会现场</h3>
      <p>以斯帖邀请国王和哈曼参加宴会。气氛紧张，真相即将揭晓...</p>

      <div class="evidence-section" v-if="clues.length > 0">
        <h4>你的证据</h4>
        <div class="evidence-list">
          <div
            v-for="clue in clues"
            :key="clue.id"
            class="evidence-item"
            @click="presentEvidence(clue.id)"
          >
            <span class="evidence-icon">{{ clue.icon }}</span>
            <span class="evidence-name">{{ clue.name }}</span>
          </div>
        </div>
      </div>

      <div class="action-section">
        <van-button
          type="primary"
          size="large"
          block
          @click="revealTruth"
        >
          揭露真相
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import type { Character } from '@/types/game'

interface Props {
  character: Character | null
  players: any[]
  clues: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  presentEvidence: [evidence: string]
}>()

const presentEvidence = (clueId: string) => {
  emit('presentEvidence', clueId)
  showToast('出示证据')
}

const revealTruth = () => {
  showToast('揭露真相！')
}
</script>

<style scoped lang="scss">
.royal-banquet {
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

.banquet-scene {
  background: $bg-primary;
  border-radius: $border-radius;
  box-shadow: $box-shadow-sm;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;

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

.evidence-section {
  margin-bottom: $spacing-lg;

  h4 {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
}

.evidence-list {
  display: grid;
  gap: $spacing-sm;

  .evidence-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-secondary;
    border-radius: $border-radius-sm;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background: darken($bg-secondary, 5%);
    }

    .evidence-icon {
      font-size: $font-size-lg;
    }

    .evidence-name {
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

.action-section {
  margin-top: $spacing-xl;
}
</style>