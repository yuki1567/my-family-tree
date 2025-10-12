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
      <h2>📝 人物追加フォーム（PersonAddModal項目ベース）</h2>
      <div class="form-container">
        <div class="form-grid">
          <FormField
            v-model="personForm.name"
            name="personName"
            label="氏名"
            placeholder="山田太郎"
          />
          <FormField
            v-model="personForm.gender"
            name="personGender"
            type="radio"
            label="性別"
            :options="genderOptions"
          />
          <FormField
            v-model="personForm.birthDate"
            name="personBirthDate"
            type="date"
            label="生年月日"
          />
          <FormField
            v-model="personForm.deathDate"
            name="personDeathDate"
            type="date"
            label="没年月日"
          />
          <FormField
            v-model="personForm.birthPlace"
            name="personBirthPlace"
            label="出生地"
            placeholder="東京都渋谷区"
          />
        </div>

        <!-- 関係性選択 -->
        <div class="relationship-selection">
          <FormField
            v-model="personForm.relationship"
            name="personRelationship"
            type="radio"
            label="関係性"
            required
            :options="relationshipOptions"
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
            name="searchQuery"
            label="検索"
            placeholder="名前で検索..."
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
              name="relationshipType"
              label="関係の種類"
              placeholder="夫婦、親子、兄弟姉妹など"
            />
            <FormField
              v-model="relationship.startDate"
              name="relationshipStartDate"
              type="date"
              label="関係開始日"
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
        <div class="error-demo-section">
          <h3>正常な状態</h3>
          <div class="form-grid">
            <FormField
              v-model="normalForm.name"
              name="normalName"
              label="氏名"
              placeholder="山田太郎"
            />
            <FormField
              v-model="normalForm.email"
              name="normalEmail"
              type="text"
              label="メールアドレス"
              placeholder="example@domain.com"
            />
          </div>
        </div>

        <div class="error-demo-section">
          <h3>エラー状態</h3>
          <div class="form-grid">
            <FormField
              v-model="errorForm.name"
              name="errorName"
              label="氏名"
              placeholder="必須項目です"
              required
              :error-message="nameError"
            />
            <FormField
              v-model="errorForm.email"
              name="errorEmail"
              type="text"
              label="メールアドレス"
              placeholder="正しい形式で入力してください"
              :error-message="emailError"
            />
          </div>
        </div>

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

    <!-- 人物追加モーダル（Issue #39実装） -->
    <section class="demo-section">
      <h2>🆕 人物追加モーダル（Issue #39実装）</h2>
      <p>
        家系図アプリの最優先機能である人物追加モーダルコンポーネントのデモです。
        リアルタイムバリデーション機能付きで、レスポンシブ対応しています。
      </p>

      <div class="person-add-demo">
        <AppButton variant="primary" @click="showPersonAddModal = true">
          <UserPlusIcon class="icon" />
          人物追加モーダルを開く
        </AppButton>

        <div class="demo-info">
          <h3>実装機能:</h3>
          <ul>
            <li>
              ✅ 全人物情報入力項目（氏名、性別、生年月日、没年月日、出生地）
            </li>
            <li>
              ✅
              リアルタイムバリデーション（日付関係チェック、未来日付制限、文字数制限）
            </li>
            <li>✅ レスポンシブデザイン対応（モバイル・デスクトップ）</li>
            <li>✅ 型安全なフォーム処理（TypeScript strict mode）</li>
            <li>✅ 独立性の高いコンポーネント設計（親にデータ委譲）</li>
          </ul>
        </div>

        <div v-if="savedPersonData" class="saved-data-display">
          <h4>保存されたデータ:</h4>
          <pre>{{ JSON.stringify(savedPersonData, null, 2) }}</pre>
        </div>
      </div>

      <!-- PersonAddModal -->
      <PersonAddModal
        v-if="showPersonAddModal"
        @close="showPersonAddModal = false"
        @save="handlePersonSave"
      />
    </section>

    <!-- モーダルベースコンポーネント -->
    <section class="demo-section">
      <h2>🪟 モーダルベースコンポーネント</h2>
      <p>人物詳細・追加・編集機能の基盤となる汎用モーダルコンポーネント：</p>

      <div class="modal-demos">
        <!-- 基本的なモーダル -->
        <div class="modal-demo-group">
          <h3>基本的なモーダル</h3>
          <AppButton @click="showBasicModal = true">
            基本モーダルを開く
          </AppButton>
        </div>

        <!-- 人物詳細モーダル風 -->
        <div class="modal-demo-group">
          <h3>人物詳細風モーダル</h3>
          <AppButton @click="showPersonModal = true">
            人物詳細モーダルを開く
          </AppButton>
        </div>

        <!-- フッター付きモーダル -->
        <div class="modal-demo-group">
          <h3>フッター付きモーダル</h3>
          <AppButton @click="showFooterModal = true">
            確認ダイアログを開く
          </AppButton>
        </div>

        <!-- 長いコンテンツモーダル -->
        <div class="modal-demo-group">
          <h3>長いコンテンツモーダル</h3>
          <AppButton @click="showNoOverlayModal = true">
            フォーム入力モーダルを開く
          </AppButton>
        </div>
      </div>

      <!-- 基本モーダル -->
      <AppModal v-if="showBasicModal" @close="showBasicModal = false">
        <p>これは基本的なモーダルです。</p>
        <p>ESCキーまたは背景をクリックして閉じることができます。</p>
        <p>
          レスポンシブ対応により、スマートフォン（768px未満）では自動的にフルスクリーン表示になります。
        </p>
      </AppModal>

      <!-- 人物詳細風モーダル -->
      <AppModal v-if="showPersonModal" @close="showPersonModal = false">
        <div class="person-detail-content">
          <div class="person-info-grid">
            <div class="info-item">
              <strong>氏名:</strong>
              <span>山田太郎</span>
            </div>
            <div class="info-item">
              <strong>生年月日:</strong>
              <span>1980年4月15日</span>
            </div>
            <div class="info-item">
              <strong>出生地:</strong>
              <span>東京都</span>
            </div>
            <div class="info-item">
              <strong>職業:</strong>
              <span>エンジニア</span>
            </div>
            <div class="info-item">
              <strong>性別:</strong>
              <span>男性</span>
            </div>
          </div>

          <div class="person-relationships">
            <h4>家族関係</h4>
            <ul>
              <li>父親: 山田一郎</li>
              <li>母親: 山田花子</li>
              <li>配偶者: 山田美子</li>
              <li>子供: 山田次郎、山田花</li>
            </ul>
          </div>
        </div>
      </AppModal>

      <!-- フッター付きモーダル -->
      <AppModal v-if="showFooterModal" @close="showFooterModal = false">
        <p>「山田太郎」を家系図から削除しますか？</p>
        <p><strong>※ この操作は取り消せません。</strong></p>

        <template #footer>
          <AppButton variant="secondary" @click="showFooterModal = false">
            キャンセル
          </AppButton>
          <AppButton variant="danger" @click="confirmDelete">
            削除する
          </AppButton>
        </template>
      </AppModal>

      <!-- 長いコンテンツモーダル -->
      <AppModal v-if="showNoOverlayModal" @close="showNoOverlayModal = false">
        <p>フォーム入力機能を含むモーダルの例です。</p>
        <p>ESCキーまたは背景クリックで閉じることができます。</p>
        <p>必要に応じてフッターにアクションボタンを配置できます。</p>

        <div class="modal-form-example">
          <FormField
            v-model="modalFormData.name"
            name="modalName"
            label="氏名"
            placeholder="必須項目"
            required
          />
          <FormField
            v-model="modalFormData.email"
            name="modalEmail"
            label="メールアドレス"
            placeholder="example@domain.com"
          />
        </div>

        <template #footer>
          <AppButton
            variant="secondary"
            :full-width="true"
            @click="showNoOverlayModal = false"
          >
            閉じる
          </AppButton>
          <AppButton :full-width="true" @click="saveModalForm">
            保存
          </AppButton>
        </template>
      </AppModal>
    </section>

    <!-- ボタンバリエーション確認 -->
    <section class="demo-section">
      <h2>🎨 AppButton CSS変数統一確認（Issue #76）</h2>
      <p>
        セカンダリボタンとデンジャーボタンのCSS変数統一を確認できます。
        全てのボタンがCSS変数（var(--color-*)）で定義されており、デザインシステムとの一貫性を保っています。
      </p>

      <div class="button-variants-demo">
        <div class="variant-group">
          <h3>Primary ボタン（CSS変数統一済み）</h3>
          <div class="button-row">
            <AppButton variant="primary"> 通常状態 </AppButton>
            <AppButton variant="primary" :is-disabled="true">
              無効状態
            </AppButton>
            <AppButton variant="primary" :is-loading="true">
              ローディング
            </AppButton>
          </div>
          <div class="css-variables-info">
            <p><strong>使用中のCSS変数:</strong></p>
            <ul>
              <li>背景色: <code>var(--button-primary-bg)</code></li>
              <li>テキスト色: <code>var(--button-primary-text)</code></li>
              <li>ボーダー色: <code>var(--button-primary-border)</code></li>
              <li>ホバー背景色: <code>var(--button-primary-bg-hover)</code></li>
              <li>ホバーテキスト色: <code>var(--button-primary-text-hover)</code></li>
              <li>ローディング背景色: <code>var(--button-loading-bg)</code></li>
              <li>ローディングテキスト色: <code>var(--button-loading-text)</code></li>
            </ul>
          </div>
        </div>

        <div class="variant-group">
          <h3>Secondary ボタン（CSS変数統一済み）</h3>
          <div class="button-row">
            <AppButton variant="secondary"> 通常状態 </AppButton>
            <AppButton variant="secondary" :is-disabled="true">
              無効状態
            </AppButton>
            <AppButton variant="secondary" :is-loading="true">
              ローディング
            </AppButton>
          </div>
          <div class="css-variables-info">
            <p><strong>使用中のCSS変数:</strong></p>
            <ul>
              <li>背景色: <code>var(--button-secondary-bg)</code></li>
              <li>テキスト色: <code>var(--button-secondary-text)</code></li>
              <li>
                ボーダー色: <code>var(--button-secondary-border)</code>
              </li>
              <li>
                ホバー背景色: <code>var(--button-secondary-bg-hover)</code>
              </li>
              <li>
                ホバーボーダー色:
                <code>var(--button-secondary-border-hover)</code>
              </li>
              <li>ホバーテキスト色: <code>var(--button-secondary-text-hover)</code></li>
            </ul>
          </div>
        </div>

        <div class="variant-group">
          <h3>Danger ボタン（CSS変数統一済み）</h3>
          <div class="button-row">
            <AppButton variant="danger"> 通常状態 </AppButton>
            <AppButton variant="danger" :is-disabled="true">
              無効状態
            </AppButton>
            <AppButton variant="danger" :is-loading="true">
              ローディング
            </AppButton>
          </div>
          <div class="css-variables-info">
            <p><strong>使用中のCSS変数:</strong></p>
            <ul>
              <li>背景色: <code>var(--button-danger-bg)</code></li>
              <li>テキスト色: <code>var(--button-danger-text)</code></li>
              <li>ボーダー色: <code>var(--button-danger-border)</code></li>
              <li>ホバー背景色: <code>var(--button-danger-bg-hover)</code></li>
              <li>ホバーテキスト色: <code>var(--button-danger-text-hover)</code></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- アイコン比較セクション -->
    <section class="demo-section">
      <h2>👶 子供アイコン比較</h2>
      <div class="icon-comparison">
        <p>
          現在の関係性で使用されている子供アイコンと、より適切な候補を比較してください：
        </p>
        <FormField
          v-model="iconComparisonValue"
          name="iconComparison"
          type="radio"
          label="子供アイコンの候補"
          :options="childIconOptions"
        />
      </div>
    </section>

    <!-- 実際の入力値確認 -->
    <section class="demo-section">
      <h2>📊 現在の入力値</h2>
      <div class="values-display">
        <div class="value-group">
          <h3>人物情報（PersonAddModal項目）</h3>
          <ul>
            <li>氏名: {{ personForm.name || '未入力' }}</li>
            <li>性別: {{ getGenderLabel(personForm.gender) || '未選択' }}</li>
            <li>生年月日: {{ personForm.birthDate || '未入力' }}</li>
            <li>没年月日: {{ personForm.deathDate || '未入力' }}</li>
            <li>出生地: {{ personForm.birthPlace || '未入力' }}</li>
            <li>
              関係性:
              {{ getRelationshipLabel(personForm.relationship) || '未選択' }}
            </li>
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

        <div class="value-group">
          <h3>フォーム入力値</h3>
          <ul>
            <li>正常フォーム名前: {{ normalForm.name || '未入力' }}</li>
            <li>正常フォームメール: {{ normalForm.email || '未入力' }}</li>
            <li>エラーフォーム名前: {{ errorForm.name || '未入力' }}</li>
            <li>エラーフォームメール: {{ errorForm.email || '未入力' }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/atoms/FormField.vue'
import AppModal from '@/components/layout/AppModal.vue'
import PersonAddModal from '@/components/organisms/PersonAddModal.vue'
import type { PersonForm } from '@/types/person'
import {
  FaceSmileIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'
import { useHead } from 'nuxt/app'
import { computed, ref } from 'vue'

// 人物追加フォーム（PersonAddModal項目ベース）
const personForm = ref({
  name: '',
  gender: '',
  birthDate: '',
  deathDate: '',
  birthPlace: '',
  relationship: '',
})

// radioボタンのオプション（PersonAddModal準拠）
const genderOptions = [
  { label: '男性', value: 'male', icon: UserIcon, colorType: 'gender' as const },
  {
    label: '女性',
    value: 'female',
    icon: UsersIcon,
    colorType: 'gender' as const,
  },
  {
    label: '不明',
    value: 'unknown',
    icon: UserIcon,
    colorType: 'gender' as const,
  },
]

// 関係性のオプション
const relationshipOptions = [
  {
    label: '父親',
    value: 'father',
    icon: UserIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '母親',
    value: 'mother',
    icon: UsersIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '子供',
    value: 'child',
    icon: FaceSmileIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '配偶者',
    value: 'spouse',
    icon: HeartIcon,
    colorType: 'relationship' as const,
  },
]

// 子供アイコン比較用のオプション
const childIconOptions = [
  {
    label: '現在（UsersIcon）',
    value: 'current',
    icon: UsersIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '笑顔（FaceSmileIcon）',
    value: 'smile',
    icon: FaceSmileIcon,
    colorType: 'relationship' as const,
  },
  {
    label: 'キラキラ（SparklesIcon）',
    value: 'sparkles',
    icon: SparklesIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '星（StarIcon）',
    value: 'star',
    icon: StarIcon,
    colorType: 'relationship' as const,
  },
  {
    label: '太陽（SunIcon）',
    value: 'sun',
    icon: SunIcon,
    colorType: 'relationship' as const,
  },
]

// アイコン比較用の値
const iconComparisonValue = ref('current')

// 検索関連
const searchQuery = ref('')

// 関係性編集
const relationship = ref({
  type: '',
  startDate: '',
})

// 正常状態のフォーム
const normalForm = ref({
  name: '',
  email: '',
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

// モーダルの表示状態
const showBasicModal = ref(false)
const showPersonModal = ref(false)
const showFooterModal = ref(false)
const showNoOverlayModal = ref(false)
const showPersonAddModal = ref(false)

// PersonAddModal関連
const savedPersonData = ref<PersonForm | null>(null)

// モーダル内のフォームデータ
const modalFormData = ref({
  name: '',
  email: '',
})

// すべてのモーダル状態を監視してbodyスクロールを制御
const isAnyModalOpen = computed(
  () =>
    showBasicModal.value ||
    showPersonModal.value ||
    showFooterModal.value ||
    showNoOverlayModal.value ||
    showPersonAddModal.value
)

useHead(() => ({
  bodyAttrs: {
    class: isAnyModalOpen.value ? 'overflow-hidden' : undefined,
  },
}))

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

// 性別の値をラベルに変換
const getGenderLabel = (value: string): string => {
  const option = genderOptions.find((opt) => opt.value === value)
  return option ? option.label : ''
}

// 関係性の値をラベルに変換
const getRelationshipLabel = (value: string): string => {
  const option = relationshipOptions.find((opt) => opt.value === value)
  return option ? option.label : ''
}

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
    gender: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    relationship: '',
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

// モーダル関連の関数
const confirmDelete = (): void => {
  showFooterModal.value = false
  alert('削除処理を実行しました')
}

const saveModalForm = (): void => {
  showNoOverlayModal.value = false
  alert(`データを保存しました: ${modalFormData.value.name}`)
  modalFormData.value = { name: '', email: '' }
}

// PersonAddModal関連の関数
const handlePersonSave = (personData: PersonForm): void => {
  savedPersonData.value = personData
  showPersonAddModal.value = false
  alert('人物データが正常に保存されました！デモ表示を確認してください。')
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

/* エラーデモセクション */
.error-demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9fafb;
}

.error-demo-section h3 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1.6rem;
  font-weight: 600;
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

/* モーダルデモ関連のスタイル */
.modal-demos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.modal-demo-group {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9fafb;
  text-align: center;
}

.modal-demo-group h3 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1.6rem;
  font-weight: 600;
}

/* 人物詳細モーダル内のスタイル */
.person-detail-content {
  font-size: 1.4rem;
}

.person-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item strong {
  color: #374151;
  font-weight: 600;
}

.info-item span {
  color: #6b7280;
}

.person-relationships h4 {
  color: #374151;
  margin-bottom: 15px;
  font-size: 1.6rem;
  font-weight: 600;
}

.person-relationships ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.person-relationships li {
  margin-bottom: 8px;
}

.modal-form-example {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

/* PersonAddModal デモ関連のスタイル */
.person-add-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-info {
  padding: 20px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.demo-info h3 {
  color: #0369a1;
  margin: 0 0 15px 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.demo-info ul {
  margin: 0;
  padding-left: 20px;
  color: #075985;
}

.demo-info li {
  margin-bottom: 8px;
  font-size: 1.4rem;
}

.saved-data-display {
  padding: 20px;
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 8px;
}

.saved-data-display h4 {
  color: #065f46;
  margin: 0 0 15px 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.saved-data-display pre {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  font-family: 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 1.3rem;
  color: #374151;
  overflow-x: auto;
  margin: 0;
}

/* ボタンバリエーションデモのスタイル */
.button-variants-demo {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.variant-group {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f9fafb;
}

.variant-group h3 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1.8rem;
  font-weight: 600;
}

.button-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.css-variables-info {
  margin-top: 15px;
  padding: 15px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.css-variables-info p {
  margin: 0 0 10px 0;
  color: #374151;
  font-weight: 600;
  font-size: 1.4rem;
}

.css-variables-info ul {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
}

.css-variables-info li {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 1.3rem;
}

.css-variables-info code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 1.2rem;
  color: #059669;
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

  .saved-data-display pre {
    font-size: 1.2rem;
  }

  .button-row {
    flex-direction: column;
  }
}
</style>
