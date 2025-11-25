<template>
  <div class="lobby-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="游戏大厅"
      left-arrow
      @click-left="$router.go(-1)"
      class="nav-bar"
    />

    <!-- 房间列表 -->
    <div class="room-list">
      <div class="section-title">
        <h3>可用房间</h3>
        <van-button size="small" @click="refreshRooms" :loading="refreshing">
          <van-icon name="replay" />
          刷新
        </van-button>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="refreshRooms">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多房间了"
          @load="loadRooms"
        >
          <div
            v-for="room in rooms"
            :key="room.id"
            class="room-card"
            @click="quickJoinRoom(room)"
          >
            <div class="room-header">
              <div class="room-info">
                <h4 class="room-name">{{ room.name }}</h4>
                <p class="room-id">房间号: {{ room.id }}</p>
              </div>
              <div class="room-status">
                <van-tag
                  :type="room.status === 'waiting' ? 'primary' : 'success'"
                  size="medium"
                >
                  {{ room.status === 'waiting' ? '等待中' : '游戏中' }}
                </van-tag>
              </div>
            </div>

            <div class="room-details">
              <div class="detail-item">
                <van-icon name="friends-o" size="16" />
                <span>{{ room.players.length }}/{{ room.maxPlayers }}人</span>
              </div>
              <div class="detail-item">
                <van-icon name="clock-o" size="16" />
                <span>{{ room.scriptTitle }}</span>
              </div>
              <div class="detail-item" v-if="room.hasPassword">
                <van-icon name="lock" size="16" />
                <span>需要密码</span>
              </div>
            </div>

            <div class="room-actions">
              <van-button
                type="primary"
                size="small"
                :disabled="room.status !== 'waiting' || room.players.length >= room.maxPlayers"
                @click.stop="showJoinDialog(room)"
              >
                {{ room.status === 'waiting' ? '加入房间' : '游戏中' }}
              </van-button>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-if="rooms.length === 0 && !loading"
            description="暂无可用房间"
            image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <van-button
        type="primary"
        size="large"
        block
        @click="$router.push('/')"
      >
        <van-icon name="home-o" />
        返回首页
      </van-button>
    </div>

    <!-- 快速加入弹窗 -->
    <van-dialog
      v-model:show="showQuickJoin"
      title="快速加入"
      show-cancel-button
      @confirm="confirmQuickJoin"
    >
      <div class="quick-join-content">
        <van-field
          v-model="joinPlayerName"
          label="昵称"
          placeholder="请输入你的昵称"
          maxlength="10"
        />
        <van-field
          v-if="selectedRoom?.hasPassword"
          v-model="joinPassword"
          type="password"
          label="密码"
          placeholder="请输入房间密码"
          maxlength="20"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'

interface Room {
  id: string
  name: string
  status: 'waiting' | 'playing'
  players: Array<{ id: string; name: string; avatar: string }>
  maxPlayers: number
  scriptTitle: string
  hasPassword: boolean
  hostId: string
}

const router = useRouter()

// 数据状态
const rooms = ref<Room[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

// 快速加入弹窗
const showQuickJoin = ref(false)
const selectedRoom = ref<Room | null>(null)
const joinPlayerName = ref('')
const joinPassword = ref('')

// 模拟房间数据
const mockRooms: Room[] = [
  {
    id: 'ABC123',
    name: '波斯皇宫',
    status: 'waiting',
    players: [
      { id: '1', name: '玩家1', avatar: '/images/avatars/1.jpg' },
      { id: '2', name: '玩家2', avatar: '/images/avatars/2.jpg' }
    ],
    maxPlayers: 6,
    scriptTitle: '以斯帖记：王后的勇气',
    hasPassword: false,
    hostId: '1'
  },
  {
    id: 'DEF456',
    name: '王后宴会',
    status: 'waiting',
    players: [
      { id: '3', name: '玩家3', avatar: '/images/avatars/3.jpg' },
      { id: '4', name: '玩家4', avatar: '/images/avatars/4.jpg' },
      { id: '5', name: '玩家5', avatar: '/images/avatars/5.jpg' }
    ],
    maxPlayers: 6,
    scriptTitle: '以斯帖记：王后的勇气',
    hasPassword: true,
    hostId: '3'
  },
  {
    id: 'GHI789',
    name: '宫廷阴谋',
    status: 'playing',
    players: [
      { id: '6', name: '玩家6', avatar: '/images/avatars/6.jpg' },
      { id: '7', name: '玩家7', avatar: '/images/avatars/7.jpg' },
      { id: '8', name: '玩家8', avatar: '/images/avatars/8.jpg' },
      { id: '9', name: '玩家9', avatar: '/images/avatars/9.jpg' }
    ],
    maxPlayers: 6,
    scriptTitle: '以斯帖记：王后的勇气',
    hasPassword: false,
    hostId: '6'
  }
]

// 加载房间列表
const loadRooms = async () => {
  if (finished.value) return

  loading.value = true

  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // TODO: 调用SDK获取房间列表API
    // const newRooms = await gameClient.room.getRoomList(page.value, pageSize)

    // 模拟数据
    if (page.value === 1) {
      rooms.value = [...mockRooms]
    }

    // 模拟分页逻辑
    if (page.value >= 1) {
      finished.value = true
    }

    page.value++
  } catch (error) {
    console.error('Load rooms error:', error)
    showToast('加载房间列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新房间列表
const refreshRooms = async () => {
  refreshing.value = true
  page.value = 1
  finished.value = false
  rooms.value = []

  await loadRooms()
  refreshing.value = false

  if (rooms.value.length > 0) {
    showToast('刷新成功')
  }
}

// 显示加入对话框
const showJoinDialog = (room: Room) => {
  selectedRoom.value = room
  joinPlayerName.value = ''
  joinPassword.value = ''
  showQuickJoin.value = true
}

// 快速加入房间
const quickJoinRoom = (room: Room) => {
  if (room.status !== 'waiting') {
    showToast('房间已在游戏中')
    return
  }

  if (room.players.length >= room.maxPlayers) {
    showToast('房间已满')
    return
  }

  showJoinDialog(room)
}

// 确认加入房间
const confirmQuickJoin = async () => {
  if (!joinPlayerName.value.trim()) {
    showToast('请输入昵称')
    return
  }

  if (selectedRoom.value?.hasPassword && !joinPassword.value.trim()) {
    showToast('请输入房间密码')
    return
  }

  showLoadingToast({
    message: '正在加入房间...',
    forbidClick: true
  })

  try {
    // TODO: 调用SDK加入房间API
    // await gameClient.room.joinRoom(selectedRoom.value!.id, joinPlayerName.value, joinPassword.value)

    // 模拟加入房间
    await new Promise(resolve => setTimeout(resolve, 1000))

    closeToast()
    showToast('加入房间成功')
    showQuickJoin.value = false

    // 跳转到房间页面
    router.push({
      name: 'Room',
      params: { roomId: selectedRoom.value!.id }
    })
  } catch (error) {
    closeToast()
    showToast('加入房间失败')
    console.error('Join room error:', error)
  }
}

// 页面加载时获取房间列表
onMounted(() => {
  loadRooms()
})
</script>

<style scoped lang="scss">
.lobby-container {
  min-height: 100vh;
  background-color: $bg-secondary;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  flex-shrink: 0;
}

.room-list {
  flex: 1;
  padding: $spacing-md;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    h3 {
      font-size: $font-size-lg;
      color: $text-primary;
    }
  }
}

.room-card {
  background: $bg-primary;
  border-radius: $border-radius;
  box-shadow: $box-shadow-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $box-shadow;
    transform: translateY(-2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-sm;

  .room-info {
    flex: 1;

    .room-name {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .room-id {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .room-status {
    flex-shrink: 0;
    margin-left: $spacing-sm;
  }
}

.room-details {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;

  .detail-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;

    .van-icon {
      flex-shrink: 0;
    }
  }
}

.room-actions {
  display: flex;
  justify-content: flex-end;
}

.bottom-actions {
  padding: $spacing-md;
  background: $bg-primary;
  border-top: 1px solid $border-color;
}

.quick-join-content {
  padding: $spacing-lg;
}
</style>