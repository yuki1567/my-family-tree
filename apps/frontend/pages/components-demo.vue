<template>
  <div class="demo-page">
    <header class="page-header">
      <h1>家系図アプリ - UIコンポーネント</h1>
      <p class="header-subtitle">
        実際の機能に即したUIコンポーネントのサンプル
      </p>
    </header>

    <!-- 人物追加フォーム例 -->
    <section class="demo-section">
      <h2>📝 人物追加フォーム</h2>
      <div class="form-container">
        <div class="form-grid">
          <FormField
            v-model="personForm.name"
            label="氏名"
            placeholder="山田太郎"
            required
          />
          <FormField
            v-model="personForm.birthDate"
            type="date"
            label="生年月日"
          />
          <FormField
            v-model="personForm.birthPlace"
            label="出生地"
            placeholder="東京都"
          />
          <FormField
            v-model="personForm.occupation"
            label="職業"
            placeholder="会社員"
          />
        </div>

        <div class="form-actions">
          <AppButton
            variant="primary"
            :width="11"
            :is-loading="isSubmitting"
            @click="handleAddPerson"
          >
            <UserPlusIcon class="icon" />
            人物を追加
          </AppButton>
          <AppButton variant="primary" :is-loading="true">
            <UserPlusIcon class="icon" />
            ローディング中
          </AppButton>
          <AppButton variant="secondary" @click="clearForm"> クリア </AppButton>
        </div>
      </div>
    </section>

    <!-- 検索機能例 -->
    <section class="demo-section">
      <h2>🔍 人物検索</h2>
      <div class="search-container">
        <div class="search-row">
          <FormField
            v-model="searchQuery"
            label="検索"
            placeholder="名前で検索..."
            size="large"
          />
          <AppButton variant="primary" @click="handleSearch"> 検索 </AppButton>
        </div>

        <div v-if="searchQuery" class="search-results">
          <p>検索結果: "{{ searchQuery }}" に関する人物</p>
        </div>
      </div>
    </section>

    <!-- 関係性編集例 -->
    <section class="demo-section">
      <h2>👥 家族関係の編集</h2>
      <div class="relationship-container">
        <div class="relationship-form">
          <h3>太郎と花子の関係</h3>
          <div class="form-grid">
            <FormField
              v-model="relationship.type"
              label="関係の種類"
              placeholder="夫婦、親子、兄弟姉妹など"
            />
            <FormField
              v-model="relationship.startDate"
              type="date"
              label="関係開始日"
              help-text="結婚日、養子縁組日など"
            />
          </div>

          <div class="form-actions">
            <AppButton variant="primary" @click="handleSaveRelationship">
              関係を保存
            </AppButton>
            <AppButton variant="danger" @click="handleDeleteRelationship">
              関係を削除
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <!-- エラー状態の例 -->
    <section class="demo-section">
      <h2>⚠️ エラー状態の表示例</h2>
      <div class="error-examples">
        <FormField
          v-model="errorForm.name"
          label="氏名"
          placeholder="必須項目です"
          required
          :error="nameError"
        />
        <FormField
          v-model="errorForm.email"
          type="email"
          label="メールアドレス"
          placeholder="正しい形式で入力してください"
          :error="emailError"
        />

        <div class="form-actions">
          <AppButton
            variant="primary"
            :disabled="hasErrors"
            @click="validateForm"
          >
            検証実行
          </AppButton>
          <AppButton variant="primary" :is-disabled="true">
            無効なボタン
          </AppButton>
        </div>
      </div>
    </section>

    <!-- アクション確認ダイアログ例 -->
    <section class="demo-section">
      <h2>🗑️ 危険なアクション</h2>
      <div class="danger-actions">
        <p>重要なデータの削除など、取り返しのつかない操作の例：</p>
        <div class="danger-buttons">
          <AppButton variant="danger" @click="handleDeletePerson">
            人物を削除
          </AppButton>
          <AppButton variant="danger" @click="handleDeleteFamily">
            家系図全体を削除
          </AppButton>
        </div>

        <div v-if="showConfirmation" class="confirmation-dialog">
          <p>この操作は取り消せません。本当に実行しますか？</p>
          <div class="confirmation-actions">
            <AppButton variant="danger" @click="confirmAction">
              はい、削除します
            </AppButton>
            <AppButton variant="secondary" @click="cancelAction">
              キャンセル
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <!-- 実際の入力値確認 -->
    <section class="demo-section">
      <h2>📊 現在の入力値</h2>
      <div class="values-display">
        <div class="value-group">
          <h3>人物情報</h3>
          <ul>
            <li>氏名: {{ personForm.name || '未入力' }}</li>
            <li>生年月日: {{ personForm.birthDate || '未入力' }}</li>
            <li>出生地: {{ personForm.birthPlace || '未入力' }}</li>
            <li>職業: {{ personForm.occupation || '未入力' }}</li>
          </ul>
        </div>

        <div class="value-group">
          <h3>検索・関係性</h3>
          <ul>
            <li>検索クエリ: {{ searchQuery || '未入力' }}</li>
            <li>関係の種類: {{ relationship.type || '未入力' }}</li>
            <li>関係開始日: {{ relationship.startDate || '未入力' }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/atoms/FormField.vue'
import { UserPlusIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'

// 人物追加フォーム
const personForm = ref({
  name: '',
  birthDate: '',
  birthPlace: '',
  occupation: '',
})

// 検索関連
const searchQuery = ref('')

// 関係性編集
const relationship = ref({
  type: '',
  startDate: '',
})

// エラー状態のフォーム
const errorForm = ref({
  name: '',
  email: '',
})

// フォーム送信状態
const isSubmitting = ref(false)

// 確認ダイアログ
const showConfirmation = ref(false)

// バリデーションエラー
const nameError = computed(() => {
  if (!errorForm.value.name) return '氏名は必須項目です'
  if (errorForm.value.name.length < 2)
    return '氏名は2文字以上で入力してください'
  return ''
})

const emailError = computed(() => {
  if (!errorForm.value.email) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(errorForm.value.email))
    return '正しいメールアドレス形式で入力してください'
  return ''
})

const hasErrors = computed(() => {
  return !!nameError.value || !!emailError.value
})

// イベントハンドラー
const handleAddPerson = async (): Promise<void> => {
  isSubmitting.value = true
  // 実際のAPIコールをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 2000))
  isSubmitting.value = false
  alert(`人物「${personForm.value.name}」を追加しました`)
}

const clearForm = (): void => {
  personForm.value = {
    name: '',
    birthDate: '',
    birthPlace: '',
    occupation: '',
  }
}

const handleSearch = (): void => {
  if (searchQuery.value) {
    alert(`「${searchQuery.value}」で検索を実行します`)
  }
}

const handleSaveRelationship = (): void => {
  alert(`関係「${relationship.value.type}」を保存しました`)
}

const handleDeleteRelationship = (): void => {
  if (confirm('この関係を削除しますか？')) {
    relationship.value = { type: '', startDate: '' }
    alert('関係を削除しました')
  }
}

const validateForm = (): void => {
  if (!hasErrors.value) {
    alert('バリデーションに成功しました')
  }
}

const handleDeletePerson = (): void => {
  showConfirmation.value = true
}

const handleDeleteFamily = (): void => {
  showConfirmation.value = true
}

const confirmAction = (): void => {
  showConfirmation.value = false
  alert('削除処理を実行しました')
}

const cancelAction = (): void => {
  showConfirmation.value = false
}
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 4rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 1.8rem;
  opacity: 0.9;
}

.demo-section {
  margin-bottom: 40px;
  padding: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #2d3748;
  margin: 0 0 25px 0;
  font-size: 2.4rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

/* フォーム関連のスタイル */
.form-container,
.search-container,
.relationship-container,
.error-examples {
  max-width: 600px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 検索セクション */
.search-row {
  display: flex;
  gap: 15px;
  align-items: end;
  margin-bottom: 20px;
}

.search-row > :first-child {
  flex: 1;
}

.search-results {
  padding: 15px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  color: #0369a1;
}

/* 関係性編集 */
.relationship-form h3 {
  color: #4a5568;
  margin-bottom: 20px;
  font-size: 1.9rem;
}

/* 危険なアクション */
.danger-actions p {
  color: #718096;
  margin-bottom: 20px;
}

.danger-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.confirmation-dialog {
  padding: 20px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  margin-top: 15px;
}

.confirmation-dialog p {
  margin: 0 0 15px 0;
  color: #742a2a;
  font-weight: 500;
}

.confirmation-actions {
  display: flex;
  gap: 10px;
}

/* 値表示セクション */
.values-display {
  background: #f7fafc;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.values-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.value-group h3 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 600;
}

.value-group ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.value-group li {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  font-family: 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 1.6rem;
}

.value-group li:last-child {
  border-bottom: none;
}

/* アイコンスタイル */
.icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .demo-page {
    padding: 15px;
  }

  .page-header {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 3.2rem;
  }

  .demo-section {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .values-display {
    grid-template-columns: 1fr;
  }
}
</style>
