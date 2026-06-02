<template>
  <div class="team-detail-page">
    <van-nav-bar
      :title="team?.name || '队伍详情'"
      left-arrow
      @click-left="$router.back()"
    />

    <div v-if="!team" class="loading-wrap">
      <van-loading size="40" vertical>加载中...</van-loading>
    </div>

    <template v-else>
      <!-- 队伍概要 -->
      <div class="team-hero">
        <h2 class="team-name">{{ team.name }}</h2>
        <div class="team-meta-row">
          <span class="team-tag">{{ team.tag }}</span>
          <span class="team-tier">{{ team.meta }}</span>
        </div>
        <p class="team-desc" v-if="team.description">{{ team.description }}</p>
      </div>

      <!-- 队伍成员 -->
      <div class="section" v-if="members.length">
        <h3 class="section-title">队伍成员</h3>
        <div class="member-list">
          <div
              v-for="(m, idx) in members"
              :key="idx"
              class="member-card"
              @click="goPetDetail(m.pokemon || m.name || m)"
            >
            <div class="member-header">
              <span class="member-slot">{{ idx + 1 }}</span>
              <span class="member-name">{{ m.pokemon || m.name || m }}</span>
              <span v-if="m.nature" class="member-nature">{{ m.nature }}</span>
            </div>
            <!-- 努力值 -->
            <div v-if="m.talents && m.talents.length" class="member-talents">
              <span v-for="t in m.talents" :key="t" class="talent-chip">{{ t }}</span>
            </div>
            <!-- 配招 -->
            <div v-if="m.skills && m.skills.length" class="member-skills">
              <span v-for="s in m.skills" :key="s" class="skill-chip">{{ s }}</span>
            </div>
            <!-- 血脉 -->
            <div v-if="m.bloodline" class="member-bloodline">
              血脉：<span class="bloodline-name">{{ m.bloodline }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 额外信息 -->
      <div class="section" v-if="team.blood_magic">
        <h3 class="section-title">血魔法</h3>
        <div class="info-row">{{ team.blood_magic }}</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getTeams, getPets } from '../db/database'

const route = useRoute()
const router = useRouter()
const team = ref(null)
const petNameToId = ref({})

const members = computed(() => {
  if (!team.value) return []
  // _members 优先（有详细配招信息），否则解析 pets JSON
  if (team.value._members && team.value._members.length) {
    return team.value._members
  }
  try {
    return JSON.parse(team.value.pets || '[]')
  } catch {
    return []
  }
})

// 查找精灵ID
function findPetId(name) {
  return petNameToId.value[name] || null
}

// 点击精灵名跳转详情页
function goPetDetail(name) {
  const petId = findPetId(name)
  if (petId) {
    router.push(`/detail/${petId}`)
  } else {
    showToast(`未找到"${name}"的信息`)
  }
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [teams, pets] = await Promise.all([getTeams(), getPets()])
    team.value = teams.find(t => t.id === id) || null
    // 构建精灵名→ID映射
    pets.forEach(p => { petNameToId.value[p.name] = p.id })
  } catch (err) {
    showToast('加载队伍失败')
    console.error('加载队伍详情失败:', err)
  }
})
</script>

<style scoped>
.team-detail-page {
  min-height: 100vh;
  padding-bottom: 20px;
}

/* 队伍概要 */
.team-hero {
  text-align: center;
  padding: 20px 16px;
  margin: 12px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}
.team-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
}
.team-meta-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}
.team-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 4px;
  background: rgba(240,192,64,0.1);
  color: var(--gold);
  border: 1px solid rgba(240,192,64,0.2);
}
.team-tier {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 4px;
  background: var(--gold-gradient);
  color: #1a0010;
}
.team-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 分区 */
.section {
  margin: 0 12px 16px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  padding: 14px 16px 6px;
  text-transform: uppercase;
}

/* 成员卡片 */
.member-list {
  padding: 0 0 8px;
}
.member-card {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.member-card:active {
  background: rgba(255,255,255,0.03);
}
.member-card:last-child {
  border-bottom: none;
}
.member-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.member-slot {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--magenta-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.member-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
  cursor: pointer;
  transition: all var(--duration-fast);
}
.member-name:active {
  opacity: 0.7;
  text-shadow: var(--gold-glow);
}
.member-nature {
  font-size: 12px;
  color: var(--gold);
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(240,192,64,0.1);
  border-radius: 4px;
}

/* 努力值 */
.member-talents {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.talent-chip {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(224,64,120,0.1);
  color: var(--magenta);
  border: 1px solid rgba(224,64,120,0.2);
}

/* 配招 */
.member-skills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.skill-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  border: 1px solid rgba(255,255,255,0.06);
}

/* 血脉 */
.member-bloodline {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
.bloodline-name {
  color: var(--gold);
  font-weight: 600;
}

.info-row {
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
