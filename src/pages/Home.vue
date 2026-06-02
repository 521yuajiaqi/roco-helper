<template>
  <div class="home-page">
    <!-- 顶部标题区 -->
    <div class="home-header">
      <h1 class="home-title">
        洛克王国
        <span class="title-accent">助手</span>
      </h1>
      <p class="home-subtitle">你的冒险指南</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-area">
      <van-search
        v-model="keyword"
        placeholder="搜名称 / 拼音 / 属性 / 编号..."
        shape="round"
        clearable
        @focus="onSearchFocus"
        @blur="onSearchBlur"
        @clear="keyword = ''; showSuggestions = false"
        ref="searchRef"
      />

      <!-- 搜索建议下拉 -->
      <div v-if="showSuggestions && keyword.trim() && suggestions.length" class="suggestions-dropdown">
        <div
          v-for="pet in suggestions"
          :key="pet.id"
          class="suggestion-item"
          @mousedown.prevent="goDetail(pet.id)"
        >
          <div class="sug-avatar">{{ pet.name.charAt(0) }}</div>
          <div class="sug-info">
            <span class="sug-name">{{ pet.name }}</span>
            <TypeBadge :element="pet.element" :sub-element="pet.sub_element" />
          </div>
          <span class="sug-id">#{{ pet.id }}</span>
        </div>
      </div>
    </div>

    <!-- 属性筛选 -->
    <div class="filter-scroll">
      <div class="filter-bar">
        <button
          v-for="el in elements"
          :key="el.value"
          :class="['filter-chip', { active: selectedElement === el.value }]"
          @click="onFilterElement(el.value)"
        >
          {{ el.label }}
        </button>
      </div>
    </div>

    <!-- 宠物列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text=""
        @load="onLoad"
      >
        <div class="pet-grid">
          <div
            v-for="pet in displayList"
            :key="pet.id"
            class="pet-card"
            @click="goDetail(pet.id)"
          >
            <div class="pet-card-img">
              <van-image :src="pet.image" width="64" height="64" round>
                <template #error>
                  <div class="pet-avatar-fallback">{{ (pet.name || '?').charAt(0) }}</div>
                </template>
              </van-image>
            </div>
            <div class="pet-card-body">
              <span class="pet-card-name">{{ pet.name }}</span>
              <TypeBadge
                :element="pet.element"
                :sub-element="pet.sub_element"
              />
            </div>
            <div class="pet-card-total">{{ petTotal(pet) }}</div>
          </div>
        </div>

        <!-- 空状态 -->
        <!-- 空状态 — 迪莫 -->
        <div v-if="!loading && displayList.length === 0" class="empty-wrap">
          <img src="/assets/empty-pet.jpg" alt="没有找到" class="empty-img" />
          <p class="empty-text">没有找到匹配的宠物</p>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="search" name="home">图鉴</van-tabbar-item>
      <van-tabbar-item icon="friends-o" name="teams">队伍</van-tabbar-item>
      <van-tabbar-item icon="balance-o" name="calculator"
        >计算器</van-tabbar-item
      >
      <van-tabbar-item icon="setting-o" name="settings">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { pinyin } from "pinyin-pro";
import { useDataStore } from "../stores/dataStore";
import TypeBadge from "../components/TypeBadge.vue";
import { getPets } from "../db/database";

const router = useRouter();
const dataStore = useDataStore();

const keyword = ref("");
const selectedElement = ref("all");
const refreshing = ref(false);
const loading = ref(false);
const finished = ref(false);
const activeTab = ref("home");
const petList = ref([]);
const showSuggestions = ref(false);

// 预计算每个宠物的拼音（全拼+首字母），用于搜索
const petPinyinMap = ref({});

function buildPinyinMap(pets) {
  const map = {};
  pets.forEach(p => {
    const py = pinyin(p.name, { toneType: 'none' });      // "di mo"
    const initial = pinyin(p.name, { pattern: 'first' }); // "dm"
    map[p.id] = {
      full: py.toLowerCase().replace(/\s/g, ''),
      initial: initial.toLowerCase().replace(/\s/g, '')
    };
  });
  return map;
}

const elements = [
  { label: "全部", value: "all" },
  { label: "火", value: "火" },
  { label: "水", value: "水" },
  { label: "草", value: "草" },
  { label: "光", value: "光" },
  { label: "电", value: "电" },
  { label: "冰", value: "冰" },
  { label: "武", value: "武" },
  { label: "毒", value: "毒" },
  { label: "地", value: "地" },
  { label: "翼", value: "翼" },
  { label: "萌", value: "萌" },
  { label: "虫", value: "虫" },
  { label: "幻", value: "幻" },
  { label: "幽", value: "幽" },
  { label: "龙", value: "龙" },
  { label: "恶", value: "恶" },
  { label: "机械", value: "机械" },
  { label: "普通", value: "普通" },
];

function matchPet(pet, kw) {
  // 名称匹配
  if (pet.name.toLowerCase().includes(kw)) return true;
  // 编号匹配
  if (String(pet.id) === kw) return true;
  // 属性匹配
  if (pet.element.includes(kw) || (pet.sub_element && pet.sub_element.includes(kw))) return true;
  // 拼音匹配
  const py = petPinyinMap.value[pet.id];
  if (py && (py.full.includes(kw) || py.initial.includes(kw))) return true;
  return false;
}

const displayList = computed(() => {
  let list = petList.value;
  if (selectedElement.value !== "all") {
    list = list.filter(
      (p) =>
        p.element === selectedElement.value ||
        p.sub_element === selectedElement.value
    );
  }
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter((p) => matchPet(p, kw));
  }
  return list;
});

// 搜索建议（前8条，去重）
const suggestions = computed(() => {
  if (!keyword.value.trim()) return [];
  const kw = keyword.value.trim().toLowerCase();
  return petList.value
    .filter(p => matchPet(p, kw))
    .slice(0, 8);
});

function petTotal(pet) {
  return (
    pet.hp +
    pet.attack +
    pet.defense +
    pet.sp_attack +
    pet.sp_defense +
    pet.speed
  );
}

function goDetail(id) {
  router.push(`/detail/${id}`);
}

const searchRef = ref(null);

function onSearchFocus() {
  showSuggestions.value = true;
  // focus 时自动选中文字，方便一键清除
  if (keyword.value) {
    const el = document.querySelector('.van-search__field');
    if (el) el.select();
  }
}
function onSearchBlur() {
  // 延迟隐藏建议，让点击事件先触发
  setTimeout(() => { showSuggestions.value = false; }, 150);
}
function onFilterElement(value) {
  selectedElement.value = value;
}

async function onRefresh() {
  await loadPets();
  refreshing.value = false;
}

async function onLoad() {
  await loadPets();
  loading.value = false;
  finished.value = true;
}

function onTabChange(name) {
  switch (name) {
    case "home":
      break;
    case "teams":
      router.push("/teams");
      break;
    case "calculator":
      router.push("/calculator");
      break;
    case "settings":
      router.push("/settings");
      break;
  }
}

async function loadPets() {
  try {
    const pets = await getPets();
    petList.value = pets;
    petPinyinMap.value = buildPinyinMap(pets);
  } catch (err) {
    showToast("数据加载失败");
    console.error("加载宠物数据失败:", err);
  }
}

loadPets();
</script>

<style scoped>
.home-page {
  padding-bottom: 56px;
  min-height: 100vh;
}

/* 标题区 */
.home-header {
  text-align: center;
  padding: 24px 16px 8px;
}
.home-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0;
}
.title-accent {
  background: var(--gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.home-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 3px;
  margin-top: 4px;
}

/* 搜索区域 */
.search-area {
  position: relative;
  z-index: 10;
}

/* 搜索建议下拉 */
.suggestions-dropdown {
  position: absolute;
  top: 54px;
  left: 16px;
  right: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  max-height: 360px;
  overflow-y: auto;
  z-index: 20;
}
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.suggestion-item:last-child {
  border-bottom: none;
}
.suggestion-item:active {
  background: rgba(255,255,255,0.04);
}
.sug-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--gold-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: #1a0010;
  flex-shrink: 0;
}
.sug-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.sug-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.sug-id {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 筛选栏 */
.filter-scroll {
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}
.filter-bar {
  display: flex;
  gap: 6px;
  padding: 0 12px;
}
.filter-chip {
  flex-shrink: 0;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  font-family: inherit;
}
.filter-chip.active {
  color: #1a0010;
  background: var(--gold-gradient);
  border-color: transparent;
  font-weight: 700;
  box-shadow: var(--gold-glow);
}
.filter-chip:active {
  transform: scale(0.94);
}

/* 宠物网格 */
.pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 4px 12px;
}

/* 宠物卡片 */
.pet-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  position: relative;
  overflow: hidden;
}
/* 紫红色微光 */
.pet-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  box-shadow: inset 0 0 20px rgba(224, 64, 120, 0.06);
  pointer-events: none;
  transition: box-shadow var(--duration-normal) var(--ease-smooth);
}
.pet-card:active {
  transform: scale(0.96);
  border-color: var(--magenta);
}
.pet-card:active::after {
  box-shadow: inset 0 0 30px rgba(224, 64, 120, 0.15),
    var(--shadow-glow-magenta);
}
.pet-card-img {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(240, 192, 64, 0.08) 0%,
    transparent 70%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.pet-avatar-fallback {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--gold-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: #1a0010;
}
.pet-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pet-card-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.pet-card-total {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
