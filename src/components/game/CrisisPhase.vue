<template>
  <div class="crisis-phase">
    <div class="phase-header">
      <h2>危机降临</h2>
      <p>哈曼的阴谋已经暴露，犹太人面临巨大的危险</p>
    </div>

    <div class="crisis-content">
      <div class="crisis-story">
        <h3>危机状况</h3>
        <p>宰相哈曼已经说服国王颁布法令，要在特定日期屠杀所有犹太人。末底改急忙找到以斯帖，恳求她向国王求情。</p>
        <p>作为王后，你必须冒着生命危险，在未经召见的情况下面见国王，这可能意味着死亡。</p>
      </div>

      <div class="character-role" v-if="character">
        <h3>你的角色</h3>
        <div v-if="character.id === 'esther'" class="role-esther">
          <p>你是以斯帖王后，现在面临重大抉择：</p>
          <ul>
            <li>保持沉默，但你的同胞将被消灭</li>
            <li>冒险面见国王，可能被处死</li>
            <li>寻找其他方式揭露哈曼的阴谋</li>
          </ul>
        </div>
        <div v-else-if="character.id === 'haman'" class="role-haman">
          <p>你是哈曼宰相，你的计划正在进行中：</p>
          <ul>
            <li>确保灭绝法令得到执行</li>
            <li>监视末底改和其他犹太人</li>
            <li>防止有人向国王求情</li>
          </ul>
        </div>
        <div v-else-if="character.id === 'mordecai'" class="role-mordecai">
          <p>你是末底改，你必须说服以斯帖采取行动：</p>
          <ul>
            <li>向以斯帖说明情况的严重性</li>
            <li>鼓励她勇敢面对危险</li>
            <li>准备后路，以防计划失败</li>
          </ul>
        </div>
        <div v-else class="role-other">
          <p>你是宫廷中的重要人物，需要选择立场：</p>
          <ul>
            <li>支持以斯帖和犹太人</li>
            <li>支持哈曼的计划</li>
            <li>保持中立，观察局势发展</li>
          </ul>
        </div>
      </div>

      <div class="available-actions">
        <h3>可选行动</h3>
        <div class="actions-list">
          <van-button
            v-for="action in availableActions"
            :key="action.id"
            :type="action.type as any"
            size="large"
            block
            @click="selectAction(action)"
            class="action-btn"
          >
            {{ action.title }}
          </van-button>
        </div>
      </div>
    </div>

    <div class="phase-actions">
      <van-button
        type="primary"
        size="large"
        block
        @click="proceedToNext"
        :disabled="!actionTaken"
      >
        继续下一步
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import type { Character } from '@/types/game'

interface Props {
  character: Character | null
  clues: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  nextPhase: []
}>()

const actionTaken = ref(false)

const availableActions = computed(() => {
  if (!props.character) return []

  const actions = [
    {
      id: 'gather_info',
      title: '收集更多信息',
      type: 'default',
      description: '继续调查，了解更多细节'
    },
    {
      id: 'seek_allies',
      title: '寻找盟友',
      type: 'default',
      description: '寻找可以信任的人合作'
    }
  ]

  if (props.character.id === 'esther') {
    actions.unshift({
      id: 'brave_decision',
      title: '勇敢面对国王',
      type: 'primary',
      description: '冒着生命危险面见国王'
    })
  } else if (props.character.id === 'haman') {
    actions.unshift({
      id: 'accelerate_plan',
      title: '加速计划执行',
      type: 'danger',
      description: '尽快完成灭绝犹太人的计划'
    })
  } else if (props.character.id === 'mordecai') {
    actions.unshift({
      id: 'persuade_esther',
      title: '说服以斯帖',
      type: 'primary',
      description: '鼓励以斯帖向国王求情'
    })
  }

  return actions
})

const selectAction = (action: any) => {
  actionTaken.value = true
  showToast(`选择了：${action.title}`)
}

const proceedToNext = () => {
  emit('nextPhase')
}
</script>

<style scoped lang="scss">
.crisis-phase {
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

.crisis-content {
  margin-bottom: $spacing-xl;
}

.crisis-story,
.character-role,
.available-actions {
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
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    padding-left: $spacing-lg;

    li {
      font-size: $font-size-md;
      color: $text-primary;
      line-height: 1.6;
      margin-bottom: $spacing-xs;
    }
  }
}

.character-role {
  .role-esther {
    border-left: 4px solid $primary-color;
  }

  .role-haman {
    border-left: 4px solid $accent-color;
  }

  .role-mordecai {
    border-left: 4px solid $success-color;
  }

  .role-other {
    border-left: 4px solid $info-color;
  }
}

.available-actions {
  .actions-list {
    .action-btn {
      margin-bottom: $spacing-md;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.phase-actions {
  margin-top: $spacing-xl;
}
</style>