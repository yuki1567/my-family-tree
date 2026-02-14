<template>
  <!-- PC/タブレット用スライドメニュー -->
  <nav class="nav-sidebar desktop-up" :class="{ expanded: isExpanded }">
    <button class="nav-toggle" @click="toggleMenu">
      <Bars3Icon class="icon" />
    </button>

    <ul class="nav-list">
      <li v-for="item in desktopMenuItems" :key="item.label">
        <a
          v-if="item.action"
          class="nav-item"
          @click="handleItemClick(item.action)"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-if="isExpanded" class="nav-label">{{ item.label }}</span>
        </a>
        <NuxtLink v-else :to="item.path" class="nav-item" active-class="active">
          <component :is="item.icon" class="nav-icon" />
          <span v-if="isExpanded" class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>

  <!-- モバイル用ボトムナビゲーション -->
  <nav class="nav-bottom mobile-only">
    <ul class="nav-list">
      <li v-for="item in mobileMenuItems" :key="item.label">
        <a
          v-if="item.action"
          class="nav-item"
          @click="handleItemClick(item.action)"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </a>
        <NuxtLink v-else :to="item.path" class="nav-item" active-class="active">
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>

  <PersonAddModal
    v-if="showAddPersonModal"
    @close="showAddPersonModal = false"
  />
</template>

<script setup lang="ts">
import {
  Bars3Icon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import PersonAddModal from '@/components/organisms/PersonAddModal.vue'

const isExpanded = ref(false)
const showAddPersonModal = ref(false)

const desktopMenuItems = [
  { label: 'ホーム', path: '/', icon: HomeIcon },
  {
    label: '人物追加',
    path: '#',
    icon: UserPlusIcon,
    action: 'openAddModal' as const,
  },
  { label: '人物一覧', path: '#', icon: UsersIcon },
  { label: '検索', path: '#', icon: MagnifyingGlassIcon },
  { label: '設定', path: '#', icon: Cog6ToothIcon },
  { label: 'ヘルプ', path: '#', icon: QuestionMarkCircleIcon },
]

const mobileMenuItems = [
  { label: 'ホーム', path: '/', icon: HomeIcon },
  { label: '人物一覧', path: '#', icon: UsersIcon },
  {
    label: '人物追加',
    path: '#',
    icon: UserPlusIcon,
    action: 'openAddModal' as const,
  },
  { label: '検索', path: '#', icon: MagnifyingGlassIcon },
  { label: '設定', path: '#', icon: Cog6ToothIcon },
]

const toggleMenu = (): void => {
  isExpanded.value = !isExpanded.value
}

const handleItemClick = (action: string): void => {
  if (action === 'openAddModal') {
    showAddPersonModal.value = true
  }
}
</script>

<style scoped>
.nav-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 6.4rem;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-primary);
  transition: width 0.2s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 767px) {
  .nav-sidebar {
    display: none;
  }
}

.nav-sidebar.expanded {
  width: 24rem;
}

.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
  border-radius: 0.8rem;
  margin: 0.8rem;
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
  margin-top: 1.6rem;
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
  cursor: pointer;
  border-radius: 0.8rem;
  margin: 0 0.8rem;
}

.nav-sidebar .nav-item:hover {
  background-color: var(--color-bg-secondary);
}

.nav-sidebar .nav-item.active {
  color: var(--color-primary);
}

.nav-sidebar .nav-icon {
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
}

.nav-sidebar .nav-label {
  font-size: 1.4rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-sidebar.expanded .nav-label {
  opacity: 1;
}

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

@media (min-width: 768px) {
  .nav-bottom {
    display: none;
  }
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
  cursor: pointer;
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
}
</style>
