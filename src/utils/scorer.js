// 性格评分算法 — 根据宠物种族值定位推荐最优性格

/**
 * 找出数组中最大的 N 个值的索引
 * @param {number[]} arr
 * @param {number} n
 * @returns {number[]} 排名前N的索引
 */
function findTopStats(arr, n) {
  const indexed = arr.map((val, idx) => ({ val, idx }))
  indexed.sort((a, b) => b.val - a.val)
  return indexed.slice(0, n).map(item => item.idx)
}

/**
 * 性格加成/减益对应的属性索引
 * 索引顺序: [物攻, 物防, 魔攻, 魔防, 速度]
 * personality 的 mod 字段: atk_mod, def_mod, spa_mod, spd_mod, spe_mod
 * 正数表示加成，负数表示减益
 */
const MOD_KEYS = ['atk_mod', 'def_mod', 'spa_mod', 'spd_mod', 'spe_mod']
// 对应 pets 表中的字段
const PET_STAT_KEYS = ['attack', 'defense', 'sp_attack', 'sp_defense', 'speed']

/**
 * 计算某性格对某宠物的适配评分
 * @param {object} pet - 宠物种族值对象
 * @param {object} personality - 性格对象（含 atk_mod~spe_mod）
 * @returns {number} 评分（1-10）
 */
export function calculatePersonalityScore(pet, personality) {
  let score = 5 // 基础分

  // 获取宠物种族值（只看5项：物攻/物防/魔攻/魔防/速度，HP不受性格影响）
  const petStats = PET_STAT_KEYS.map(key => pet[key])
  // 找出种族值最高的2项
  const top2Indices = findTopStats(petStats, 2)
  // 找出种族值最低的2项
  const bottom2Indices = findTopStats(petStats.map(v => -v), 2)

  MOD_KEYS.forEach((modKey, idx) => {
    const mod = personality[modKey] || 1.0

    if (mod > 1.0) {
      // 性格加成的属性
      if (top2Indices.includes(idx)) {
        score += 3 // 加成命中核心属性
      } else if (bottom2Indices.includes(idx)) {
        score -= 1 // 加成命中无用属性
      }
    } else if (mod < 1.0) {
      // 性格减益的属性
      if (top2Indices.includes(idx)) {
        score -= 4 // 减益命中核心属性，严重扣分
      } else if (bottom2Indices.includes(idx)) {
        score += 2 // 减益命中无用属性，影响不大
      }
    }
  })

  // 归一化到1-10
  return Math.max(1, Math.min(10, score))
}

/**
 * 获取某宠物的性格推荐列表（3-5个）
 * @param {object} pet - 宠物对象
 * @param {object[]} allPersonalities - 所有性格列表
 * @returns {object[]} 推荐性格数组，含 name, score, reason
 */
export function getRecommendations(pet, allPersonalities) {
  if (!pet || !allPersonalities?.length) return []

  const scored = allPersonalities.map(p => ({
    ...p,
    score: calculatePersonalityScore(pet, p)
  }))

  // 按评分降序
  scored.sort((a, b) => b.score - a.score)

  // 返回3-5个
  const count = Math.min(Math.max(scored.length, 3), 5)
  return scored.slice(0, count)
}

/**
 * 将宠物种族值映射到简评定性
 * @param {object} pet
 * @returns {string} 定位描述
 */
export function describePosition(pet) {
  const stats = [
    { name: 'HP', value: pet.hp },
    { name: '物攻', value: pet.attack },
    { name: '物防', value: pet.defense },
    { name: '魔攻', value: pet.sp_attack },
    { name: '魔防', value: pet.sp_defense },
    { name: '速度', value: pet.speed }
  ]
  stats.sort((a, b) => b.value - a.value)
  return `偏${stats[0].name}与${stats[1].name}型`
}
