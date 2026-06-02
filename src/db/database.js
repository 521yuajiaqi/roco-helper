// 数据库操作封装
// Web 和原生环境统一使用内存缓存（JSON 静态导入，避免 file:// 协议下动态 import 失败）

// 静态导入数据文件（Vite 构建时直接打进 bundle）
import petsJson from '../data/pets.json'
import skillsJson from '../data/skills.json'
import personalitiesJson from '../data/personalities.json'
import petSkillsJson from '../data/pet_skills.json'
import recommendationsJson from '../data/recommendations.json'
import teamsJson from '../data/teams.json'

// 内存数据缓存
const dbCache = {
  pets: petsJson,
  skills: skillsJson,
  personalities: personalitiesJson,
  petSkills: petSkillsJson,
  recommendations: recommendationsJson,
  teams: teamsJson
}

// ===== 初始化 =====

export async function initDatabase() {
  // 静态导入已完成，数据已在内存中
  console.log('数据加载完成:', {
    pets: dbCache.pets.length,
    skills: dbCache.skills.length,
    personalities: dbCache.personalities.length,
    petSkills: dbCache.petSkills.length,
    recommendations: dbCache.recommendations.length,
    teams: dbCache.teams.length
  })
}

// ===== 查询接口 =====

export async function getPets() {
  return dbCache.pets
}

export async function getPetById(id) {
  return dbCache.pets.find(p => p.id === id) || null
}

export async function getPersonalityRecommendations(petId) {
  return dbCache.recommendations
    .filter(r => r.pet_id === petId)
    .map(r => {
      const personality = dbCache.personalities.find(p => p.id === r.personality_id)
      return {
        id: r.personality_id,
        name: personality?.name || '未知',
        score: r.score,
        reason: r.reason,
        effect: personality?.effect || ''
      }
    })
    .sort((a, b) => b.score - a.score)
}

export async function getPetSkills(petId) {
  return dbCache.petSkills
    .filter(ps => ps.pet_id === petId)
    .map(ps => {
      const skill = dbCache.skills.find(s => s.id === ps.skill_id)
      return skill ? { ...skill, learn_method: ps.learn_method } : null
    })
    .filter(Boolean)
}

export async function getTeams() {
  return dbCache.teams
}

export async function importData(data) {
  if (data.pets) dbCache.pets = data.pets
  if (data.skills) dbCache.skills = data.skills
  if (data.personalities) dbCache.personalities = data.personalities
  if (data.petSkills) dbCache.petSkills = data.petSkills
  if (data.recommendations) dbCache.recommendations = data.recommendations
  if (data.teams) dbCache.teams = data.teams
}
