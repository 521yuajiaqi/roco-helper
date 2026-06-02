<template>
  <div class="personality-list">
    <div v-if="loading" class="status-mini">
      <van-loading size="18" />
    </div>
    <div v-else-if="personalities.length === 0" class="status-mini">
      暂无性格推荐数据
    </div>
    <div
      v-for="item in personalities"
      :key="item.id"
      class="personality-item"
    >
      <div class="item-left">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-effect" v-if="item.effect">{{ item.effect }}</span>
      </div>
      <div class="item-right">
        <span :class="['item-score', scoreClass(item.score)]">{{ item.score }}分</span>
        <span class="item-reason">{{ item.reason }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPersonalityRecommendations } from '../db/database'

const props = defineProps({
  petId: { type: Number, required: true }
})

const personalities = ref([])
const loading = ref(true)

function scoreClass(score) {
  if (score >= 8) return 'score-high'
  if (score >= 5) return 'score-mid'
  return 'score-low'
}

onMounted(async () => {
  try {
    personalities.value = await getPersonalityRecommendations(props.petId)
  } catch (err) {
    console.error('加载性格推荐失败:', err)
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
.personality-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--duration-fast);
}
.personality-item:last-child {
  border-bottom: none;
}
.personality-item:active {
  background: rgba(255, 255, 255, 0.02);
}
.item-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.item-effect {
  font-size: 11px;
  color: var(--text-muted);
}
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.item-score {
  font-size: 13px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}
.score-high {
  color: #1a0010;
  background: var(--gold-gradient);
}
.score-mid {
  color: var(--gold);
  background: rgba(240, 192, 64, 0.1);
  border: 1px solid rgba(240, 192, 64, 0.2);
}
.score-low {
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
}
.item-reason {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  max-width: 140px;
}
</style>
