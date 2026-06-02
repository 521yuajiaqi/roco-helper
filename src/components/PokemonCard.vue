<template>
  <div class="pokemon-card" @click="$emit('click')">
    <div class="card-avatar">
      <van-image
        v-if="pokemon.image"
        :src="pokemon.image"
        width="56" height="56"
        round
      >
        <template #error>
          <div class="avatar-fallback">{{ firstChar }}</div>
        </template>
      </van-image>
      <div v-else class="avatar-fallback">{{ firstChar }}</div>
    </div>
    <div class="card-info">
      <span class="card-name">{{ pokemon.name }}</span>
      <TypeBadge :element="pokemon.element" :sub-element="pokemon.sub_element" />
    </div>
    <span class="card-total">{{ total }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TypeBadge from './TypeBadge.vue'

const props = defineProps({
  pokemon: { type: Object, required: true }
})

defineEmits(['click'])

const firstChar = computed(() => (props.pokemon.name || '?').charAt(0))

const total = computed(() => {
  const p = props.pokemon
  return p.hp + p.attack + p.defense + p.sp_attack + p.sp_defense + p.speed
})
</script>

<style scoped>
.pokemon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}
.pokemon-card:active {
  border-color: var(--magenta);
  box-shadow: var(--shadow-glow-magenta);
}
.card-avatar { flex-shrink: 0; }
.avatar-fallback {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--gold-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #1a0010;
}
.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.card-name {
  font-weight: bold;
  font-size: 15px;
  color: var(--text-primary);
}
.card-total {
  color: var(--text-muted);
  font-size: 13px;
  flex-shrink: 0;
}
</style>
