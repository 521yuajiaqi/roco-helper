import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initDatabase } from './db/database'
import 'vant/lib/index.css' // Vant 基础样式
import './styles/global.css' // 全局样式

async function bootstrap() {
  // 初始化数据库（加载内置JSON数据）
  await initDatabase()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

bootstrap()
