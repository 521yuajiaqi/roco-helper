import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: { title: '洛克王国助手' }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../pages/Detail.vue'),
    meta: { title: '宠物详情' }
  },
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('../pages/Teams.vue'),
    meta: { title: '队伍推荐' }
  },
  {
    path: '/team/:id',
    name: 'TeamDetail',
    component: () => import('../pages/TeamDetail.vue'),
    meta: { title: '队伍详情' }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('../pages/Calculator.vue'),
    meta: { title: '克制计算' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHashHistory(), // Hash 模式，兼容移动端文件协议
  routes
})

// 页面标题更新
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 洛克王国助手` : '洛克王国助手'
})

export default router
