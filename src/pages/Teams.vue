<template>
  <div class="teams-page">
    <van-nav-bar title="队伍推荐" />

    <!-- 队伍标签筛选 -->
    <div class="filter-scroll">
      <div class="filter-bar">
        <button
          v-for="tag in tags"
          :key="tag.value"
          :class="['filter-chip', { active: activeTag === tag.value }]"
          @click="activeTag = tag.value"
        >
          {{ tag.label }}
        </button>
      </div>
    </div>

    <!-- 队伍卡片列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="team-list">
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          class="team-card"
          @click="goTeamDetail(team.id)"
        >
          <div class="team-card-header">
            <h3 class="team-name">{{ team.name }}</h3>
            <div class="team-tags">
              <span class="team-meta">{{ team.meta }}</span>
              <span class="team-tag">{{ team.tag }}</span>
            </div>
          </div>
          <p class="team-desc" v-if="team.description">{{ team.description }}</p>
          <div class="team-pets">
            <span
              v-for="(name, idx) in getPetNames(team)"
              :key="idx"
              class="pet-name-chip"
            >{{ name }}</span>
          </div>
        </div>
      </div>

      <div v-if="!loading && filteredTeams.length === 0" class="empty-wrap">
        <img src="/assets/empty-pet.jpg" alt="没有队伍" class="empty-img" />
        <p class="empty-text">暂无队伍数据</p>
      </div>
    </van-pull-refresh>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getTeams } from '../db/database'

const router = useRouter()
const activeTag = ref('all')
const activeTab = ref('teams')
const refreshing = ref(false)
const loading = ref(false)
const teams = ref([])

const tags = [
  { label: '全部', value: 'all' },
  { label: '天梯', value: '天梯' },
  { label: 'PVP', value: 'pvp' },
  { label: 'PVE', value: 'pve' }
]

const filteredTeams = computed(() => {
  if (activeTag.value === 'all') return teams.value
  return teams.value.filter(t => t.tag === activeTag.value)
})

async function onRefresh() {
  await loadTeams()
  refreshing.value = false
}

async function loadTeams() {
  try {
    teams.value = await getTeams()
    loading.value = false
  } catch (err) {
    showToast('加载队伍失败')
    console.error('加载队伍数据失败:', err)
  }
}

function goTeamDetail(id) {
  router.push(`/team/${id}`)
}

function getPetNames(team) {
  try { return JSON.parse(team.pets || '[]') } catch { return [] }
}

function onTabChange(name) {
  switch (name) {
    case 'home': router.push('/'); break
    case 'calculator': router.push('/calculator'); break
    case 'settings': router.push('/settings'); break
  }
}

loadTeams()
</script>

<style scoped>
.teams-page {
  padding-bottom: 56px;
  min-height: 100vh;
}

.filter-scroll {
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar { display: none; }
.filter-bar {
  display: flex;
  gap: 6px;
  padding: 0 12px;
}
.filter-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  font-family: inherit;
}
.filter-chip.active {
  color: #1a0010;
  background: var(--gold-gradient);
  font-weight: 700;
  border-color: transparent;
  box-shadow: var(--gold-glow);
}
.filter-chip:active {
  transform: scale(0.94);
}

/* 队伍卡片 */
.team-list {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.team-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all var(--duration-normal) var(--ease-smooth);
  position: relative;
  overflow: hidden;
}
.team-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  box-shadow: inset 0 0 20px rgba(224, 64, 120, 0.04);
  pointer-events: none;
}
.team-card:active {
  border-color: var(--magenta);
  transform: scale(0.985);
}
.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.team-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.team-tags {
  display: flex;
  gap: 6px;
}
.team-meta {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--gold-gradient);
  color: #1a0010;
}
.team-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(240, 192, 64, 0.1);
  color: var(--gold);
  border: 1px solid rgba(240, 192, 64, 0.2);
}
.team-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 10px;
}
.team-pets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.pet-name-chip {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.04);
  color: var(--text-muted);
  border: 1px solid rgba(255,255,255,0.06);
}
</style>
