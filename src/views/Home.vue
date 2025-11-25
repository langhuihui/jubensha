<template>
  <div class="home-container">
    <!-- 顶部标题 -->
    <div class="header">
      <h1 class="title">{{ GAME_CONFIG.GAME_NAME }}</h1>
      <p class="subtitle">基于圣经以斯帖记的多人剧本杀游戏</p>
    </div>

    <!-- 游戏介绍 -->
    <div class="game-intro">
      <div class="intro-card">
        <h2>游戏背景</h2>
        <p>波斯帝国时期，美丽的犹太少女以斯帖成为王后。当宰相哈曼策划灭绝所有犹太人时，以斯帖必须冒着生命危险，在国王面前揭露真相，拯救自己的同胞。</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <van-icon name="friends-o" size="24" />
          <span>4-6人游戏</span>
        </div>
        <div class="feature-item">
          <van-icon name="clock-o" size="24" />
          <span>90分钟体验</span>
        </div>
        <div class="feature-item">
          <van-icon name="star-o" size="24" />
          <span>精彩剧情</span>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="actions">
      <van-button
        type="primary"
        size="large"
        block
        @click="showCreateRoom = true"
        class="action-btn"
      >
        <van-icon name="plus" />
        创建房间
      </van-button>

      <van-button
        type="default"
        size="large"
        block
        @click="showJoinRoom = true"
        class="action-btn"
      >
        <van-icon name="friends" />
        加入房间
      </van-button>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <p class="version">版本 1.0.0</p>
      <p class="copyright">基于圣经故事改编</p>
    </div>

    <!-- 创建房间弹窗 -->
    <van-popup v-model:show="showCreateRoom" position="bottom" :style="{ height: '60%' }">
      <div class="popup-header">
        <h3>创建房间</h3>
        <van-button type="default" size="small" @click="showCreateRoom = false">取消</van-button>
      </div>
      <div class="popup-content">
        <van-form @submit="createRoom">
          <van-field
            v-model="roomForm.playerName"
            name="playerName"
            label="昵称"
            placeholder="请输入你的昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
            maxlength="10"
          />
          <van-field
            v-model="roomForm.password"
            type="password"
            name="password"
            label="房间密码"
            placeholder="选填，设置后他人需要密码才能加入"
            maxlength="20"
          />
          <van-field name="maxPlayers" label="最大人数">
            <template #input>
              <van-stepper v-model="roomForm.maxPlayers" min="4" max="6" />
            </template>
          </van-field>
          <div class="form-actions">
            <van-button type="primary" size="large" block native-type="submit">
              创建房间
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 加入房间弹窗 -->
    <van-popup v-model:show="showJoinRoom" position="bottom" :style="{ height: '50%' }">
      <div class="popup-header">
        <h3>加入房间</h3>
        <van-button type="default" size="small" @click="showJoinRoom = false">取消</van-button>
      </div>
      <div class="popup-content">
        <van-form @submit="joinRoom">
          <van-field
            v-model="joinForm.playerName"
            name="playerName"
            label="昵称"
            placeholder="请输入你的昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
            maxlength="10"
          />
          <van-field
            v-model="joinForm.roomId"
            name="roomId"
            label="房间号"
            placeholder="请输入房间号"
            :rules="[{ required: true, message: '请输入房间号' }]"
            maxlength="6"
          />
          <van-field
            v-model="joinForm.password"
            type="password"
            name="password"
            label="房间密码"
            placeholder="如果房间有密码，请输入"
            maxlength="20"
          />
          <div class="form-actions">
            <van-button type="primary" size="large" block native-type="submit">
              加入房间
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { GAME_CONFIG } from '@/data/game-config'

const router = useRouter()

// 弹窗状态
const showCreateRoom = ref(false)
const showJoinRoom = ref(false)

// 创建房间表单
const roomForm = reactive({
  playerName: '',
  password: '',
  maxPlayers: 6
})

// 加入房间表单
const joinForm = reactive({
  playerName: '',
  roomId: '',
  password: ''
})

// 创建房间
const createRoom = async () => {
  if (!roomForm.playerName.trim()) {
    showToast('请输入昵称')
    return
  }

  showLoadingToast({
    message: '正在创建房间...',
    forbidClick: true
  })

  try {
    // TODO: 调用SDK创建房间API
    // const roomId = await gameClient.room.createRoom(GAME_CONFIG.SCRIPT_ID, roomForm.maxPlayers)

    // 模拟创建房间
    await new Promise(resolve => setTimeout(resolve, 1000))
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()

    closeToast()
    showCreateRoom.value = false
    showToast('房间创建成功')

    // 跳转到房间页面
    router.push({
      name: 'Room',
      params: { roomId }
    })
  } catch (error) {
    closeToast()
    showToast('创建房间失败')
    console.error('Create room error:', error)
  }
}

// 加入房间
const joinRoom = async () => {
  if (!joinForm.playerName.trim()) {
    showToast('请输入昵称')
    return
  }

  if (!joinForm.roomId.trim()) {
    showToast('请输入房间号')
    return
  }

  showLoadingToast({
    message: '正在加入房间...',
    forbidClick: true
  })

  try {
    // TODO: 调用SDK加入房间API
    // await gameClient.room.joinRoom(joinForm.roomId, joinForm.playerName)

    // 模拟加入房间
    await new Promise(resolve => setTimeout(resolve, 1000))

    closeToast()
    showJoinRoom.value = false
    showToast('加入房间成功')

    // 跳转到房间页面
    router.push({
      name: 'Room',
      params: { roomId: joinForm.roomId }
    })
  } catch (error) {
    closeToast()
    showToast('加入房间失败')
    console.error('Join room error:', error)
  }
}
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #8B4513 0%, #DAA520 100%);
  padding: $spacing-xl $spacing-md;
  display: flex;
  flex-direction: column;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: $spacing-xxl;

  .title {
    font-size: $font-size-xxl;
    font-weight: bold;
    margin-bottom: $spacing-sm;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    font-size: $font-size-md;
    opacity: 0.9;
  }
}

.game-intro {
  flex: 1;
  margin-bottom: $spacing-xl;

  .intro-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;

    h2 {
      font-size: $font-size-lg;
      margin-bottom: $spacing-sm;
    }

    p {
      font-size: $font-size-sm;
      line-height: 1.6;
      opacity: 0.9;
    }
  }

  .features {
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: $border-radius-lg;
    padding: $spacing-lg;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-xs;

      span {
        font-size: $font-size-xs;
        opacity: 0.9;
      }
    }
  }
}

.actions {
  margin-bottom: $spacing-xl;

  .action-btn {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.footer {
  text-align: center;
  opacity: 0.7;

  p {
    font-size: $font-size-xs;
    margin-bottom: $spacing-xs;

    &:last-child {
      margin-bottom: 0;
    }
  }
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
  padding: $spacing-lg;

  .form-actions {
    margin-top: $spacing-xl;
  }
}
</style>