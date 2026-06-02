import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 全局数据状态管理
export const useDataStore = defineStore('data', () => {
  // 数据版本
  const version = ref('1.0.0')
  const lastUpdate = ref('')

  // 最近浏览记录（最多20条）
  const recentPets = ref([])

  // 添加浏览记录
  function addRecentPet(pet) {
    recentPets.value = [
      pet,
      ...recentPets.value.filter(p => p.id !== pet.id)
    ].slice(0, 20)
  }

  // 数据更新状态
  const updateStatus = ref('idle') // idle | checking | downloading | done | error

  return {
    version,
    lastUpdate,
    recentPets,
    addRecentPet,
    updateStatus
  }
})
