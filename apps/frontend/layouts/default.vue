<template>
  <div class="layout">
    <NavigationMenu />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavigationMenu from '@/components/organisms/NavigationMenu.vue'
</script>

<style scoped>
.layout {
  height: 100vh;
  width: 100vw;
  display: flex;
}

/* PC/タブレット表示時のメインコンテンツ */
@media (min-width: 768px) {
  .main-content {
    margin-left: 4.8rem; /* スライドメニューの幅分 */
    flex: 1;
    overflow: auto;
  }
}

/* モバイル表示時のメインコンテンツ */
@media (max-width: 767px) {
  .main-content {
    flex: 1;
    padding-bottom: 6.4rem; /* ボトムナビゲーションの高さ分 */
    overflow: auto;
  }
}
</style>
