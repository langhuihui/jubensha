import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '以斯帖记剧本杀' }
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: () => import('@/views/Lobby.vue'),
    meta: { title: '游戏大厅' }
  },
  {
    path: '/room/:roomId',
    name: 'Room',
    component: () => import('@/views/Room.vue'),
    meta: { title: '游戏房间' },
    props: true
  },
  {
    path: '/game/:roomId',
    name: 'Game',
    component: () => import('@/views/Game.vue'),
    meta: { title: '游戏中' },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router