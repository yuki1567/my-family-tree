<template>
  <div>
    <!-- PC/タブレット用スライドメニュー -->
    <nav :class="['nav-sidebar', { expanded: isExpanded }]" class="desktop-up">
      <button class="nav-toggle" @click="toggleMenu" aria-label="メニュー切替">
        <component :is="Bars3Icon" class="icon" />
      </button>

      <ul class="nav-list">
        <li v-for="item in desktopMenuItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="['nav-item', { active: isActive(item.path) }]"
            @click="closeMenuOnMobile"
          >
            <component :is="item.icon" class="nav-icon" />
            <span v-if="isExpanded" class="nav-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- モバイル用ボトムナビゲーション -->
    <nav class="nav-bottom mobile-only">
      <ul class="nav-list">
        <li v-for="item in mobileMenuItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="['nav-item', { active: isActive(item.path) }]"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  Bars3Icon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'

interface MenuItem {
  label: string
  path: string
  icon: typeof HomeIcon
}

const route = useRoute()
const isExpanded = ref(false)

// PC/タブレット用メニュー項目
const desktopMenuItems: MenuItem[] = [
  { label: 'ホーム', path: '/', icon: HomeIcon },
  { label: '人物追加', path: '/persons/add', icon: UserPlusIcon },
  { label: '人物一覧', path: '/persons', icon: UsersIcon },
  { label: '検索', path: '/search', icon: MagnifyingGlassIcon },
  { label: '設定', path: '/settings', icon: Cog6ToothIcon },
  { label: 'ヘルプ', path: '/help', icon: QuestionMarkCircleIcon },
]

// モバイル用メニュー項目
const mobileMenuItems: MenuItem[] = [
  { label: 'ホーム', path: '/', icon: HomeIcon },
  { label: '人物一覧', path: '/persons', icon: UsersIcon },
  { label: '人物追加', path: '/persons/add', icon: UserPlusIcon },
  { label: '検索', path: '/search', icon: MagnifyingGlassIcon },
  { label: '設定', path: '/settings', icon: Cog6ToothIcon },
]

/**
 * メニューの展開/折りたたみを切り替え
 */
const toggleMenu = (): void => {
  isExpanded.value = !isExpanded.value
}

/**
 * モバイル表示時にメニューをクローズ
 */
const closeMenuOnMobile = (): void => {
  if (window.innerWidth <= 768) {
    isExpanded.value = false
  }
}

/**
 * 現在のパスがアクティブかどうかを判定
 */
const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* ============================================
   PC/タブレット用スライドメニュー
   ============================================ */
.nav-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 4.8rem;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-primary);
  transition: width 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-sidebar.expanded {
  width: 24rem;
}

.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 4.8rem;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.nav-toggle:hover {
  background-color: var(--color-bg-secondary);
}

.nav-toggle .icon {
  width: 2.4rem;
  height: 2.4rem;
}

.nav-sidebar .nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.nav-sidebar .nav-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.nav-sidebar .nav-item:hover {
  background-color: var(--color-bg-secondary);
}

.nav-sidebar .nav-item.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.nav-sidebar .nav-icon {
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
}

.nav-sidebar .nav-label {
  font-size: 1.4rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-sidebar.expanded .nav-label {
  opacity: 1;
}

/* ============================================
   モバイル用ボトムナビゲーション
   ============================================ */
.nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6.4rem;
  background-color: var(--color-bg-primary);
  border-top: 1px solid var(--color-border-primary);
  z-index: 100;
}

.nav-bottom .nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}

.nav-bottom .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.8rem 1.2rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  flex: 1;
}

.nav-bottom .nav-item:hover {
  color: var(--color-primary);
}

.nav-bottom .nav-item.active {
  color: var(--color-primary);
}

.nav-bottom .nav-icon {
  width: 2.4rem;
  height: 2.4rem;
}

.nav-bottom .nav-label {
  font-size: 1rem;
  font-weight: 500;
}
</style>
