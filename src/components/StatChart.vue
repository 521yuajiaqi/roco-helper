<template>
  <div class="stat-chart">
    <v-chart :option="chartOption" autoresize style="height: 220px" />
    <div class="stat-position">{{ positionText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  pet: { type: Object, required: true }
})

const chartOption = computed(() => {
  const p = props.pet
  const labels = ['HP', '物攻', '物防', '魔攻', '魔防', '速度']
  const values = [p.hp, p.attack, p.defense, p.sp_attack, p.sp_defense, p.speed]

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,0,20,0.9)',
      borderColor: 'rgba(240,192,64,0.3)',
      textStyle: { color: '#ece0f0', fontSize: 12 }
    },
    grid: { left: 36, right: 16, top: 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
      axisLabel: { color: '#b0a0c0', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 200,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#706080', fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: getBarColor(v, 'top') },
            { offset: 1, color: getBarColor(v, 'bottom') }
          ])
        }
      })),
      barWidth: '45%',
      emphasis: {
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(240, 192, 64, 0.5)'
        }
      }
    }]
  }
})

function getBarColor(value, pos) {
  if (value >= 150) return pos === 'top' ? '#ff5070' : '#c03050'
  if (value >= 120) return pos === 'top' ? '#f0c040' : '#c09020'
  if (value >= 90)  return pos === 'top' ? '#e04078' : '#a02050'
  return pos === 'top' ? '#706080' : '#403050'
}

import * as echarts from 'echarts/core'

const positionText = computed(() => {
  const p = props.pet
  const stats = [
    { name: 'HP', value: p.hp },
    { name: '物攻', value: p.attack },
    { name: '物防', value: p.defense },
    { name: '魔攻', value: p.sp_attack },
    { name: '魔防', value: p.sp_defense },
    { name: '速度', value: p.speed }
  ]
  stats.sort((a, b) => b.value - a.value)
  return `定位简评：偏${stats[0].name}与${stats[1].name}型`
})
</script>

<style scoped>
.stat-chart {
  padding: 0 4px;
}
.stat-position {
  text-align: center;
  padding: 4px 0 12px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
</style>
