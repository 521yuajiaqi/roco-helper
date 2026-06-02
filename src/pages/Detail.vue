<template>
  <div class="detail-page">
    <van-nav-bar
      :title="pet?.name || '宠物详情'"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrap">
      <van-loading size="40" color="var(--gold)" vertical>加载中...</van-loading>
    </div>

    <template v-else-if="pet">
      <!-- 宠物头部信息 -->
      <div class="detail-hero">
        <div class="hero-img-wrap">
          <van-image :src="pet.image" width="88" height="88" round>
              <template #error>
                <div class="hero-avatar">{{ (pet.name || '?').charAt(0) }}</div>
              </template>
            </van-image>
          <div class="hero-glow"></div>
        </div>
        <h2 class="hero-name">{{ pet.name }}</h2>
        <TypeBadge :element="pet.element" :sub-element="pet.sub_element" />
        <p class="hero-location" v-if="pet.location">
          <span class="loc-dot">◆</span> 捕捉地点：{{ pet.location }}
        </p>
      </div>

      <!-- 种族值面板 -->
      <div class="section">
        <h3 class="section-title">种族值</h3>
        <StatChart :pet="pet" />
        <div class="stat-total-row">
          <span class="total-badge">总和 {{ petTotal }}</span>
        </div>
      </div>

      <!-- 性格推荐 -->
      <div class="section">
        <h3 class="section-title">性格推荐</h3>
        <PersonalityList :pet-id="pet.id" />
      </div>

      <!-- 技能池 -->
      <div class="section">
        <h3 class="section-title">技能池</h3>
        <SkillTable :pet-id="pet.id" />
      </div>

      <!-- 属性克制 -->
      <div class="section" v-if="typeRelations.length">
        <h3 class="section-title">属性克制分析</h3>
        <div class="type-relations">
          <div
            v-for="item in typeRelations"
            :key="item.element"
            :class="['type-relation-item', relationClass(item.multiplier)]"
          >
            <TypeBadge :element="item.element" />
            <span class="multiplier">{{ formatMultiplier(item.multiplier) }}</span>
          </div>
        </div>
      </div>

      <!-- 进化链 -->
      <div class="section" v-if="evolutionList.length > 1">
        <h3 class="section-title">进化链</h3>
        <div class="evolution-chain">
          <template v-for="(evo, idx) in evolutionList" :key="idx">
            <div class="evo-node">
              <span class="evo-name">{{ evo }}</span>
            </div>
            <div v-if="idx < evolutionList.length - 1" class="evo-arrow">
              <van-icon name="arrow" color="var(--gold)" />
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <!-- 空状态 — 迪莫 -->
    <div v-else class="empty-wrap">
      <img src="/assets/empty-pet.jpg" alt="未找到" class="empty-img" />
      <p class="empty-text">未找到该宠物信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getPetById } from '../db/database'
import { getTypeRelations } from '../utils/typeChart'
import { useDataStore } from '../stores/dataStore'
import TypeBadge from '../components/TypeBadge.vue'
import StatChart from '../components/StatChart.vue'
import PersonalityList from '../components/PersonalityList.vue'
import SkillTable from '../components/SkillTable.vue'

const route = useRoute()
const dataStore = useDataStore()
const pet = ref(null)
const loading = ref(true)

const petTotal = computed(() => {
  if (!pet.value) return 0
  const p = pet.value
  return p.hp + p.attack + p.defense + p.sp_attack + p.sp_defense + p.speed
})

const typeRelations = computed(() => {
  if (!pet.value) return []
  return getTypeRelations(pet.value.element, pet.value.sub_element)
})

const evolutionList = computed(() => {
  if (!pet.value?.evolution) return []
  try {
    return JSON.parse(pet.value.evolution)
  } catch {
    return [pet.value.evolution]
  }
})

function relationClass(multiplier) {
  if (multiplier >= 2) return 'weak'
  if (multiplier <= 0.5) return 'resist'
  return 'neutral'
}

function formatMultiplier(m) {
  return m >= 2 ? `${m}x` : m <= 0.5 ? `${m}x` : `${m}x`
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    pet.value = await getPetById(id)
    if (pet.value) {
      dataStore.addRecentPet(pet.value)
    }
  } catch (err) {
    showToast('加载详情失败')
    console.error('加载宠物详情失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page {
  padding-bottom: 20px;
  min-height: 100vh;
}

/* 宠物头部 */
.detail-hero {
  text-align: center;
  padding: 20px 16px 28px;
  position: relative;
}
.hero-img-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}
.hero-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(224, 64, 120, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.hero-avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  background: var(--gold-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  color: #1a0010;
}
.hero-name {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px;
  letter-spacing: 1px;
}
.hero-location {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}
.loc-dot {
  color: var(--gold);
  font-size: 8px;
  vertical-align: middle;
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

.stat-total-row {
  text-align: center;
  padding: 0 0 14px;
}
.total-badge {
  display: inline-block;
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
  background: rgba(240, 192, 64, 0.08);
  padding: 4px 16px;
  border-radius: 12px;
  border: 1px solid rgba(240, 192, 64, 0.15);
}

/* 属性克制列表 */
.type-relations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
}
.type-relation-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.type-relation-item.weak {
  border-color: rgba(255, 50, 50, 0.25);
  background: rgba(255, 50, 50, 0.06);
}
.type-relation-item.resist {
  border-color: rgba(50, 150, 255, 0.2);
  background: rgba(50, 150, 255, 0.05);
}
.multiplier {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 进化链 */
.evolution-chain {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px 16px;
  flex-wrap: wrap;
}
.evo-node {
  background: var(--bg-elevated);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-md);
  padding: 6px 14px;
}
.evo-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}
.evo-arrow {
  color: var(--gold);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
