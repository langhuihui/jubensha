<template>
  <div class="queen-decision">
    <div class="phase-header">
      <h2>王后的抉择</h2>
      <p>以斯帖必须做出重大决定：冒险面见国王，还是眼睁睁看着同胞灭亡</p>
    </div>

    <div class="decision-content">
      <div class="dilemma">
        <h3>两难处境</h3>
        <p>未经国王召见而面见国王是死罪，但如果不行动，所有犹太人都将被消灭。</p>
        <p>末底改对以斯帖说："焉知你得了王后的位分，不是为现今的机会吗？"</p>
      </div>

      <div class="decision-options" v-if="character?.id === 'esther'">
        <h3>你的决定</h3>
        <van-button
          type="primary"
          size="large"
          block
          @click="makeDecision('brave')"
          class="decision-btn"
        >
          冒险面见国王
        </van-button>
        <van-button
          type="default"
          size="large"
          block
          @click="makeDecision('hesitate')"
          class="decision-btn"
        >
          犹豫不决
        </van-button>
      </div>

      <div class="waiting" v-else>
        <h3>等待王后的决定</h3>
        <p>以斯帖正在考虑是否冒险面见国王...</p>
        <van-loading />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import type { Character } from '@/types/game'

interface Props {
  character: Character | null
  isHost: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  makeDecision: [decision: string]
}>()

const makeDecision = (decision: string) => {
  showToast(`做出了决定：${decision === 'brave' ? '冒险面见国王' : '犹豫不决'}`)
  emit('makeDecision', decision)
}
</script>

<style scoped lang="scss">
.queen-decision {
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

.decision-content {
  .dilemma,
  .decision-options,
  .waiting {
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
    margin-bottom: $spacing-md;
  }
}

.decision-options {
  .decision-btn {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.waiting {
  text-align: center;
  color: $text-secondary;
}
</style>