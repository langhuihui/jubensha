import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant UI 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 样式引入
import '@/styles/global.scss'
import '@/styles/mobile.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')