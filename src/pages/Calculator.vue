<template>
  <div class="calculator-page">
    <van-nav-bar title="属性克制计算器" />

    <!-- 攻击方 -->
    <div class="calc-section">
      <h3 class="calc-section-title">攻击方</h3>
      <div class="calc-row">
        <div class="calc-field">
          <label class="calc-label">主属性</label>
          <div class="element-select">
            <button
              v-for="el in ELEMENTS"
              :key="'atk'+el"
              :class="['el-chip', { selected: atkElement === el }]"
              :style="el === atkElement ? chipStyle(el) : {}"
              @click="atkElement = el"
            >{{ el }}</button>
          </div>
        </div>
      </div>
      <div class="calc-row">
        <div class="calc-field">
          <label class="calc-label">副属性 <span class="optional-tag">可选</span></label>
          <div class="element-select">
            <button
              v-for="el in subOptions"
              :key="'atksub'+el"
              :class="['el-chip', { selected: atkSubElement === el }]"
              :style="el === atkSubElement ? chipStyle(el) : {}"
              @click="atkSubElement = el"
            >{{ el }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 防守方 -->
    <div class="calc-section">
      <h3 class="calc-section-title">防守方</h3>
      <div class="calc-row">
        <div class="calc-field">
          <label class="calc-label">主属性</label>
          <div class="element-select">
            <button
              v-for="el in ELEMENTS"
              :key="'def'+el"
              :class="['el-chip', { selected: defElement === el }]"
              :style="el === defElement ? chipStyle(el) : {}"
              @click="defElement = el"
            >{{ el }}</button>
          </div>
        </div>
      </div>
      <div class="calc-row">
        <div class="calc-field">
          <label class="calc-label">副属性 <span class="optional-tag">可选</span></label>
          <div class="element-select">
            <button
              v-for="el in subOptions"
              :key="'defsub'+el"
              :class="['el-chip', { selected: defSubElement === el }]"
              :style="el === defSubElement ? chipStyle(el) : {}"
              @click="defSubElement = el"
            >{{ el }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 计算结果 -->
    <div v-if="resultReady" class="calc-result">
      <div class="result-glow"></div>
      <span class="result-label">克制倍数</span>
      <span class="result-value" :class="resultClass">{{ multiplierText }}</span>
      <p class="result-desc">{{ resultDescription }}</p>
    </div>

    <!-- 完整克制表入口 -->
    <div class="calc-section">
      <div class="full-chart-link" @click="showFullChart = !showFullChart">
        <span>18×18 完整属性克制表</span>
        <van-icon :name="showFullChart ? 'arrow-up' : 'arrow-down'" color="var(--gold)" />
      </div>

      <!-- 展开的克制表 -->
      <div v-if="showFullChart" class="full-chart-wrap">
        <div class="full-chart-scroll">
          <table class="full-chart-table">
            <thead>
              <tr>
                <th></th>
                <th v-for="el in ELEMENTS" :key="'h'+el" class="chart-th">{{ el }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="atk in ELEMENTS" :key="'r'+atk">
                <td class="chart-td chart-label">{{ atk }}</td>
                <td
                  v-for="def in ELEMENTS"
                  :key="atk+def"
                  :class="['chart-td', chartCellClass(atk, def)]"
                >
                  {{ TYPE_CHART[atk][def] || 1 }}x
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { calcMultiplier, describeMultiplier, ELEMENTS, TYPE_CHART } from '../utils/typeChart'

const router = useRouter()

const atkElement = ref('')
const atkSubElement = ref('无')
const defElement = ref('')
const defSubElement = ref('无')
const activeTab = ref('calculator')
const showFullChart = ref(false)

// 副属性选项（含"无"）
const subOptions = ['无', ...ELEMENTS]

// 18属性颜色映射（洛克王国手游）
const ELEMENT_COLORS = {
  '火': { bg: 'rgba(240,128,48,0.25)', text: '#f0a050' },
  '水': { bg: 'rgba(104,144,240,0.25)', text: '#80b0f0' },
  '草': { bg: 'rgba(120,200,80,0.25)', text: '#90d070' },
  '光': { bg: 'rgba(248,240,128,0.25)', text: '#f8f0a0' },
  '电': { bg: 'rgba(248,208,48,0.25)', text: '#f8d030' },
  '冰': { bg: 'rgba(152,216,216,0.25)', text: '#a8e0e0' },
  '武': { bg: 'rgba(192,48,40,0.25)', text: '#e05040' },
  '毒': { bg: 'rgba(160,64,160,0.25)', text: '#c070c0' },
  '地': { bg: 'rgba(224,192,104,0.25)', text: '#e0c068' },
  '翼': { bg: 'rgba(168,144,240,0.25)', text: '#b0a0f0' },
  '萌': { bg: 'rgba(248,88,136,0.25)', text: '#f06898' },
  '虫': { bg: 'rgba(168,184,32,0.25)', text: '#b8c040' },
  '幻': { bg: 'rgba(200,120,240,0.25)', text: '#d098f0' },
  '幽': { bg: 'rgba(112,88,152,0.25)', text: '#9070c0' },
  '龙': { bg: 'rgba(112,56,248,0.25)', text: '#8850f0' },
  '恶': { bg: 'rgba(112,88,72,0.25)', text: '#a08060' },
  '机械': { bg: 'rgba(184,184,208,0.25)', text: '#c0c0e0' },
  '普通': { bg: 'rgba(180,180,168,0.25)', text: '#d0d0c0' }
}

function chipStyle(el) {
  const c = ELEMENT_COLORS[el]
  if (!c) return {}
  return { background: c.bg, color: c.text, borderColor: c.text }
}

const multiplier = computed(() => {
  if (!atkElement.value || !defElement.value) return null
  return calcMultiplier(
    atkElement.value,
    atkSubElement.value === '无' ? '' : atkSubElement.value,
    defElement.value,
    defSubElement.value === '无' ? '' : defSubElement.value
  )
})

const resultReady = computed(() => atkElement.value && defElement.value)
const multiplierText = computed(() => multiplier.value !== null ? `${multiplier.value}x` : '—')
const resultClass = computed(() => {
  if (multiplier.value === null) return ''
  if (multiplier.value >= 2) return 'super'
  if (multiplier.value <= 0.5) return 'resist'
  return 'normal'
})
const resultDescription = computed(() => {
  if (multiplier.value === null) return ''
  return describeMultiplier(multiplier.value)
})

function chartCellClass(atk, def) {
  const val = TYPE_CHART[atk]?.[def] || 1
  if (val >= 2) return 'cell-super'
  if (val <= 0.5) return 'cell-resist'
  return 'cell-neutral'
}

function onTabChange(name) {
  switch (name) {
    case 'home': router.push('/'); break
    case 'teams': router.push('/teams'); break
    case 'settings': router.push('/settings'); break
  }
}
</script>

<style scoped>
.calculator-page {
  padding-bottom: 56px;
  min-height: 100vh;
}

/* 分区卡片 */
.calc-section {
  margin: 12px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px;
}
.calc-section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--gold);
  margin: 0 0 10px;
  text-transform: uppercase;
}
.calc-row {
  margin-bottom: 10px;
}
.calc-row:last-child { margin-bottom: 0; }
.calc-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: block;
}
.optional-tag {
  font-size: 10px;
  color: var(--text-muted);
}

/* 属性选择网格 */
.element-select {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.el-chip {
  padding: 4px 10px;
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  font-family: inherit;
}
.el-chip.selected {
  font-weight: 700;
  box-shadow: 0 0 8px currentColor;
}
.el-chip:active {
  transform: scale(0.92);
}

/* 计算结果 */
.calc-result {
  margin: 16px 12px;
  padding: 28px 16px;
  text-align: center;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}
.result-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 192, 64, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.result-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.result-value {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -2px;
  position: relative;
  z-index: 1;
}
.result-value.super {
  color: #ff4060;
  text-shadow: 0 0 20px rgba(255, 64, 96, 0.4);
}
.result-value.resist {
  color: #4080ff;
  text-shadow: 0 0 20px rgba(64, 128, 255, 0.4);
}
.result-value.normal {
  color: var(--gold);
  text-shadow: var(--gold-glow);
}
.result-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
}

/* 完整克制表 */
.full-chart-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
}
.full-chart-wrap {
  margin-top: 12px;
}
.full-chart-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
}
.full-chart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.chart-th, .chart-td {
  padding: 4px 3px;
  text-align: center;
  min-width: 32px;
}
.chart-th {
  color: var(--gold);
  font-weight: 600;
  font-size: 9px;
}
.chart-label {
  color: var(--text-secondary);
  font-weight: 600;
  text-align: left;
}
.cell-super {
  color: #ff4060;
  background: rgba(255, 64, 96, 0.08);
  border-radius: 3px;
  font-weight: 700;
}
.cell-resist {
  color: #4080ff;
  background: rgba(64, 128, 255, 0.08);
  border-radius: 3px;
}
.cell-neutral {
  color: var(--text-muted);
}
</style>
