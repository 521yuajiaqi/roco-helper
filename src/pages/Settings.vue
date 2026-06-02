<template>
  <div class="settings-page">
    <van-nav-bar title="设置" />

    <!-- 关于卡片 -->
    <div class="about-hero">
      <div class="about-icon">
        <img src="/assets/icon.png" alt="洛克王国助手" class="about-icon-img" />
      </div>
      <h2 class="about-name">洛克王国助手</h2>
      <p class="about-version">v{{ dataStore.version }}</p>
      <p class="about-desc">你的洛克王国冒险指南</p>
    </div>

    <!-- 数据 -->
    <h3 class="section-title">数据</h3>
    <div class="settings-group">
      <div class="settings-item" @click="checkUpdate">
        <div class="settings-item-left">
          <span class="settings-item-icon">↻</span>
          <span>检查更新</span>
        </div>
        <div class="settings-item-right">
          <van-loading v-if="updating" size="16" />
          <span v-else class="settings-item-value">{{ dataStore.lastUpdate || '点击检查' }}</span>
        </div>
      </div>
      <div class="settings-item">
        <div class="settings-item-left">
          <span class="settings-item-icon">ⓘ</span>
          <span>数据版本</span>
        </div>
        <span class="settings-item-value">{{ dataStore.version }}</span>
      </div>
    </div>

    <!-- 外观 -->
    <h3 class="section-title">外观</h3>
    <div class="settings-group">
      <div class="settings-item">
        <div class="settings-item-left">
          <span class="settings-item-icon">☾</span>
          <span>深色模式</span>
        </div>
        <van-switch v-model="darkMode" size="22px" active-color="var(--magenta)" @change="onDarkModeChange" />
      </div>
    </div>

    <!-- 反馈 -->
    <h3 class="section-title">反馈</h3>
    <div class="settings-group">
      <div class="settings-item" @click="onFeedback">
        <div class="settings-item-left">
          <span class="settings-item-icon">✎</span>
          <span>数据纠错</span>
        </div>
        <van-icon name="arrow" color="var(--text-muted)" />
      </div>
    </div>

    <!-- GitHub 入口 -->
    <div class="github-link" @click="onOpenGitHub">
      <span>在 GitHub 上查看项目</span>
      <van-icon name="arrow" color="var(--text-muted)" />
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="search" name="home">图鉴</van-tabbar-item>
      <van-tabbar-item icon="friends-o" name="teams">队伍</van-tabbar-item>
      <van-tabbar-item icon="balance-o" name="calculator">计算器</van-tabbar-item>
      <van-tabbar-item icon="setting-o" name="settings">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useDataStore } from '../stores/dataStore'
import { checkForUpdates } from '../utils/updater'

const router = useRouter()
const dataStore = useDataStore()

const activeTab = ref('settings')
const darkMode = ref(true) // 默认启用暗黑主题
const updating = ref(false)

async function checkUpdate() {
  updating.value = true
  dataStore.updateStatus = 'checking'
  try {
    const hasUpdate = await checkForUpdates()
    if (hasUpdate) {
      showToast('数据已更新')
    } else {
      showToast('已是最新版本')
    }
  } catch (err) {
    showToast('检查更新失败')
    console.error('检查更新失败:', err)
  } finally {
    updating.value = false
  }
}

function onDarkModeChange(value) {
  // 暗黑模式默认开启，关闭时移除暗黑类
  document.documentElement.classList.toggle('light', !value)
}

function onFeedback() {
  showDialog({
    title: '数据纠错',
    message: '发现数据错误？请通过 GitHub Issue 提交纠错信息。\n\n我们会尽快核实并更新！'
  })
}

function onOpenGitHub() {
  // TODO: 替换为实际 GitHub 仓库地址
  showToast('GitHub 仓库地址待配置')
}

function onTabChange(name) {
  switch (name) {
    case 'home': router.push('/'); break
    case 'teams': router.push('/teams'); break
    case 'calculator': router.push('/calculator'); break
  }
}
</script>

<style scoped>
.settings-page {
  padding-bottom: 56px;
  min-height: 100vh;
}

/* 关于区域 */
.about-hero {
  text-align: center;
  padding: 28px 16px 20px;
}
.about-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
  box-shadow: var(--shadow-glow-magenta);
}
.about-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.about-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px;
}
.about-version {
  font-size: 12px;
  color: var(--gold);
  font-weight: 600;
  margin: 0 0 8px;
}
.about-desc {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* 分区标题 */
.section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  padding: 8px 20px 6px;
  text-transform: uppercase;
}

/* 设置项组 */
.settings-group {
  margin: 0 12px 8px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.settings-item:last-child {
  border-bottom: none;
}
.settings-item:active {
  background: rgba(255, 255, 255, 0.02);
}
.settings-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
}
.settings-item-icon {
  font-size: 16px;
  color: var(--gold);
  width: 20px;
  text-align: center;
}
.settings-item-value {
  font-size: 13px;
  color: var(--text-muted);
}
.settings-item-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* GitHub 链接 */
.github-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 12px 8px;
  padding: 14px 16px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}
.github-link:active {
  border-color: var(--gold);
}
</style>
