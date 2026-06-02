<template>
  <!-- 页面过渡动画容器 -->
  <router-view v-slot="{ Component, route }">
    <transition :name="'page'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
// App 根组件 — 路由容器，含页面过渡动画
</script>
