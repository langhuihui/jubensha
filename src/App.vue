<template>
  <div id="app" class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 移动端适配：设置根字体大小
  const setRootFontSize = () => {
    const width = window.innerWidth
    const fontSize = Math.min(16, (width / 375) * 16) // 375 是 iPhone 6/7/8 的宽度
    document.documentElement.style.fontSize = `${fontSize}px`
  }

  setRootFontSize()
  window.addEventListener('resize', setRootFontSize)

  // 禁用双击缩放
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  })

  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: var(--bg-secondary);
}
</style>