<template>
  <!-- ヘッダー -->
  <header class="app-header">
    <h1 class="app-title">Family Tree App</h1>
    <button class="settings-btn">設定</button>
  </header>

  <!-- メインコンテンツエリア -->
  <div class="content-area">
    <!-- 家系図表示エリア -->
    <main class="family-tree-area">
      <div class="tree-container">
        <!-- アイコンテスト -->
        <div class="icon-test">
          <h2>アイコンテスト</h2>
          <div class="icons">
            <UserIcon class="icon" />
            <UsersIcon class="icon" />
            <UserIcon class="icon male" />
            <UserIcon class="icon female" />
            <PlusIcon class="icon" />
            <CheckIcon class="icon" />
            <XMarkIcon class="icon" />
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- フローティング追加ボタン -->
  <button class="floating-add-btn" title="人物を追加">+</button>
</template>

<script setup lang="ts">
import {
  CheckIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
</script>

<style scoped>
/* ヘッダー */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 1.6rem;
  background-color: var(--color-background);
  border-top: 3px solid var(--color-primary);
  border-bottom: 1px solid var(--color-border);
}

.app-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.9rem;
  font-weight: 600;
}

.settings-btn {
  padding: 0.5rem 1.6rem;
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: 1.6rem;
}

.settings-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-background);
}

/* メインコンテンツエリア */
.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 家系図表示エリア */
.family-tree-area {
  flex: 1;
  background-color: #f1f5f9;
  padding: 1.6rem;
  overflow: auto;
}

.tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.2rem;
}

/* アイコンテスト 後で削除*/
.icon-test {
  text-align: center;
}

.icons {
  display: flex;
  gap: 1.6rem;
  justify-content: center;
}

.icon {
  width: 24px;
  height: 24px;
}

.icon.male {
  color: #3b82f6; /* 青色（男性） */
}

.icon.female {
  color: #ec4899; /* ピンク色（女性） */
}

/* アイコンテスト */

.tree-placeholder {
  text-align: center;
  padding: 3.2rem;
  border: 2px dashed var(--color-border);
  border-radius: 0.6rem;
  background-color: var(--color-surface);
}

.tree-placeholder h2 {
  margin: 0 0 0.8rem 0;
  color: var(--color-text);
}

.tree-placeholder p {
  margin: 0;
  color: var(--color-text-secondary);
}

/* コントロールパネル */
.control-panel {
  flex: 0 0 200px;
  background-color: var(--color-surface);
  border-left: 1px solid var(--color-border);
  padding: 1.6rem;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 2.4rem;
}

.control-group h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.6rem;
  color: var(--color-text);
  font-weight: 600;
}

.control-btn {
  display: block;
  width: 100%;
  margin-bottom: 0.8rem;
  padding: 0.8rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1.6rem;
}

.control-btn:hover {
  background-color: var(--color-border);
}

/* フローティング追加ボタン */
.floating-add-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.floating-add-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .content-area {
    flex-direction: column;
  }

  .control-panel {
    flex: 0 0 auto;
    border-left: none;
    border-top: 1px solid var(--color-border);
    padding: 0.75rem;
  }

  .control-group {
    display: inline-block;
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }

  .control-btn {
    display: inline-block;
    width: auto;
    margin-right: 0.5rem;
    margin-bottom: 0.25rem;
    padding: 0.375rem 0.75rem;
  }

  .floating-add-btn {
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}
</style>
