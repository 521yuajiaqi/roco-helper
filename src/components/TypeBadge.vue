<template>
  <span class="type-badges">
    <span class="type-badge" :style="badgeStyle(element)">{{ element }}</span>
    <span v-if="subElement" class="type-badge" :style="badgeStyle(subElement)">{{ subElement }}</span>
  </span>
</template>

<script setup>
defineProps({
  element: { type: String, required: true },
  subElement: { type: String, default: '' }
})

// 18属性颜色（洛克王国手游 — 暗黑主题适配）
const ELEMENT_COLORS = {
  '火': { bg: 'rgba(240,128,48,0.2)', text: '#f0a050', border: 'rgba(240,160,80,0.35)' },
  '水': { bg: 'rgba(104,144,240,0.2)', text: '#80b0f0', border: 'rgba(128,176,240,0.35)' },
  '草': { bg: 'rgba(120,200,80,0.2)', text: '#90d070', border: 'rgba(144,208,112,0.35)' },
  '光': { bg: 'rgba(248,240,128,0.2)', text: '#f8f0a0', border: 'rgba(248,240,160,0.35)' },
  '电': { bg: 'rgba(248,208,48,0.2)', text: '#f8d855', border: 'rgba(248,216,85,0.35)' },
  '冰': { bg: 'rgba(152,216,216,0.2)', text: '#a8e0e0', border: 'rgba(168,224,224,0.35)' },
  '武': { bg: 'rgba(192,48,40,0.2)', text: '#e06050', border: 'rgba(224,96,80,0.35)' },
  '毒': { bg: 'rgba(160,64,160,0.2)', text: '#c070c0', border: 'rgba(192,112,192,0.35)' },
  '地': { bg: 'rgba(224,192,104,0.2)', text: '#f0d080', border: 'rgba(240,208,128,0.35)' },
  '翼': { bg: 'rgba(168,144,240,0.2)', text: '#b8a4f0', border: 'rgba(184,164,240,0.35)' },
  '萌': { bg: 'rgba(248,88,136,0.2)', text: '#f068a0', border: 'rgba(240,104,160,0.35)' },
  '虫': { bg: 'rgba(168,184,32,0.2)', text: '#c8d850', border: 'rgba(200,216,80,0.35)' },
  '幻': { bg: 'rgba(200,120,240,0.2)', text: '#d098f0', border: 'rgba(208,152,240,0.35)' },
  '幽': { bg: 'rgba(112,88,152,0.2)', text: '#a080c0', border: 'rgba(160,128,192,0.35)' },
  '龙': { bg: 'rgba(112,56,248,0.2)', text: '#a060f0', border: 'rgba(160,96,240,0.35)' },
  '恶': { bg: 'rgba(112,88,72,0.2)', text: '#b09070', border: 'rgba(176,144,112,0.35)' },
  '机械': { bg: 'rgba(184,184,208,0.2)', text: '#d0d0e0', border: 'rgba(208,208,224,0.35)' },
  '普通': { bg: 'rgba(180,180,168,0.2)', text: '#d0d0c0', border: 'rgba(208,208,192,0.35)' }
}

function badgeStyle(element) {
  const c = ELEMENT_COLORS[element] || { bg: 'transparent', text: '#ccc', border: 'rgba(255,255,255,0.15)' }
  return {
    background: c.bg,
    color: c.text,
    border: `1px solid ${c.border}`
  }
}
</script>

<style scoped>
.type-badges {
  display: inline-flex;
  gap: 4px;
}
.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.7;
  letter-spacing: 0.3px;
}
</style>
