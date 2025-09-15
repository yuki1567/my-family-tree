<template>
  <!-- ヘッダー -->
  <header class="app-header">
    <h1 class="app-title">
      Family Tree App
    </h1>
    <button class="settings-btn">
      設定
    </button>
  </header>

  <!-- メインコンテンツエリア -->
  <div class="content-area">
    <!-- 家系図表示エリア -->
    <main class="family-tree-area">
      <div class="tree-container">
        <!-- アイコンテストセクション -->
        <div class="icon-test-section">
          <h2>Nuxticon テスト</h2>

          <!-- 基本アイコン -->
          <div class="icon-group">
            <h3>基本アイコン</h3>
            <div class="icon-list">
              <div class="icon-item">
                <Icon name="heroicons:user" />
                <span>user</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:users" />
                <span>users</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:user-plus" />
                <span>user-plus</span>
              </div>
            </div>
          </div>

          <!-- 性別アイコン（エイリアス使用） -->
          <div class="icon-group">
            <h3>性別アイコン（エイリアス）</h3>
            <div class="icon-list">
              <div class="icon-item">
                <Icon name="male" />
                <span>male (alias)</span>
              </div>
              <div class="icon-item">
                <Icon name="female" />
                <span>female (alias)</span>
              </div>
            </div>
          </div>

          <!-- 操作アイコン -->
          <div class="icon-group">
            <h3>操作アイコン</h3>
            <div class="icon-list">
              <div class="icon-item">
                <Icon name="heroicons:plus" />
                <span>plus</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:pencil" />
                <span>pencil</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:trash" />
                <span>trash</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:cog-6-tooth" />
                <span>settings</span>
              </div>
            </div>
          </div>

          <!-- 状態アイコン -->
          <div class="icon-group">
            <h3>状態アイコン</h3>
            <div class="icon-list">
              <div class="icon-item">
                <Icon name="heroicons:check" />
                <span>check</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:x-mark" />
                <span>x-mark</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:exclamation-triangle" />
                <span>alert</span>
              </div>
              <div class="icon-item">
                <Icon name="heroicons:information-circle" />
                <span>info</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- フローティング追加ボタン -->
  <button
    class="floating-add-btn"
    title="人物を追加"
  >
    +
  </button>
</template>

<script setup lang="ts"></script>

<style scoped>
/* ヘッダー */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem;
  background-color: var(--color-background);
  border-top: 3px solid var(--color-primary);
  border-bottom: 1px solid var(--color-border);
}

.app-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.settings-btn {
  padding: 0.3rem 1rem;
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
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
  padding: 1rem;
  overflow: auto;
}

.tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
}

/* アイコンテストセクション */
.icon-test-section {
  max-width: 800px;
  width: 100%;
}

.icon-test-section h2 {
  margin: 0 0 2rem 0;
  color: var(--color-primary);
  text-align: center;
}

.icon-group {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.icon-group h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-background);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.icon-item :deep(.icon) {
  font-size: 24px;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
}

.icon-item span {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.tree-placeholder {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  background-color: var(--color-surface);
}

.tree-placeholder h2 {
  margin: 0 0 0.5rem 0;
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
  padding: 1rem;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.control-btn {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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
