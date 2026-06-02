<template>
  <div class="skill-table">
    <div v-if="loading" class="status-mini">
      <van-loading size="18" />
    </div>
    <div v-else-if="skills.length === 0" class="status-mini">
      暂无技能数据
    </div>
    <template v-else>
      <!-- 学习方式筛选器 -->
      <div class="skill-filters">
        <button
          v-for="m in ['all', '等级', '遗传', '技能石']"
          :key="m"
          :class="['skill-filter-chip', { active: selectedMethod === m }]"
          @click="selectedMethod = m"
        >
          {{ m === 'all' ? '全部' : m }}
        </button>
      </div>

      <!-- 技能列表 -->
      <div
        v-for="skill in filteredSkills"
        :key="skill.id"
        class="skill-item"
      >
        <div class="skill-top">
          <span class="skill-name">{{ skill.name }}</span>
          <TypeBadge :element="skill.element" />
        </div>
        <div class="skill-meta">
          <span :class="['skill-cat', skill.category]">{{ skill.category }}</span>
          <span class="skill-stat">威力 {{ skill.power || '—' }}</span>
          <span class="skill-stat">PP {{ skill.pp }}</span>
          <span class="skill-stat">命中 {{ skill.accuracy || '—' }}%</span>
        </div>
        <p class="skill-desc" v-if="skill.description">{{ skill.description }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPetSkills } from '../db/database'
import TypeBadge from './TypeBadge.vue'

const props = defineProps({
  petId: { type: Number, required: true }
})

const skills = ref([])
const loading = ref(true)
const selectedMethod = ref('all')

const filteredSkills = computed(() => {
  if (selectedMethod.value === 'all') return skills.value
  return skills.value.filter(s => s.learn_method === selectedMethod.value)
})

onMounted(async () => {
  try {
    skills.value = await getPetSkills(props.petId)
  } catch (err) {
    console.error('加载技能失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.status-mini {
  text-align: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 13px;
}

/* 筛选器 */
.skill-filters {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
}
.skill-filter-chip {
  padding: 4px 12px;
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  font-family: inherit;
}
.skill-filter-chip.active {
  color: #1a0010;
  background: var(--gold-gradient);
  border-color: transparent;
  font-weight: 700;
}
.skill-filter-chip:active {
  transform: scale(0.94);
}

/* 技能项 */
.skill-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--duration-fast);
}
.skill-item:last-child {
  border-bottom: none;
}
.skill-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.skill-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.skill-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.skill-cat {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}
.skill-cat.物理 {
  background: rgba(240, 128, 48, 0.15);
  color: #f0a050;
}
.skill-cat.魔法 {
  background: rgba(104, 144, 240, 0.15);
  color: #80b0f0;
}
.skill-cat.变化 {
  background: rgba(160, 160, 160, 0.15);
  color: #c0c0c0;
}
.skill-stat {
  font-size: 11px;
  color: var(--text-muted);
}
.skill-desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
