<template>
  <div class="demo-page">
    <h1>UIコンポーネント デモページ</h1>

    <section class="demo-section">
      <h2>AppButton コンポーネント</h2>

      <div class="demo-group">
        <h3>基本バリエーション</h3>
        <div class="demo-row">
          <AppButton>Primary Button</AppButton>
          <AppButton variant="secondary">Secondary Button</AppButton>
          <AppButton variant="danger">Danger Button</AppButton>
        </div>
      </div>

      <div class="demo-group">
        <h3>サイズバリエーション</h3>
        <div class="demo-row">
          <AppButton size="small">Small</AppButton>
          <AppButton size="medium">Medium</AppButton>
          <AppButton size="large">Large</AppButton>
        </div>
      </div>

      <div class="demo-group">
        <h3>状態バリエーション</h3>
        <div class="demo-row">
          <AppButton>Normal</AppButton>
          <AppButton disabled>Disabled</AppButton>
          <AppButton loading>Loading</AppButton>
        </div>
      </div>

      <div class="demo-group">
        <h3>クリック動作確認</h3>
        <div class="demo-row">
          <AppButton @click="handleButtonClick">Click Me!</AppButton>
          <p v-if="buttonClickCount > 0">クリック回数: {{ buttonClickCount }}</p>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>FormField コンポーネント</h2>

      <div class="demo-group">
        <h3>基本入力フィールド</h3>
        <div class="demo-column">
          <FormField v-model="textValue" label="テキスト入力" placeholder="テキストを入力してください" />
          <p>入力値: {{ textValue }}</p>
        </div>
      </div>

      <div class="demo-group">
        <h3>入力タイプバリエーション</h3>
        <div class="demo-column">
          <FormField v-model="emailValue" type="email" label="メールアドレス" placeholder="email@example.com" />
          <FormField v-model="passwordValue" type="password" label="パスワード" placeholder="パスワードを入力" />
          <FormField v-model="numberValue" type="number" label="数値" placeholder="数値を入力" />
        </div>
      </div>

      <div class="demo-group">
        <h3>サイズバリエーション</h3>
        <div class="demo-column">
          <FormField v-model="smallValue" size="small" label="Small" placeholder="小さいサイズ" />
          <FormField v-model="mediumValue" size="medium" label="Medium" placeholder="中サイズ" />
          <FormField v-model="largeValue" size="large" label="Large" placeholder="大きいサイズ" />
        </div>
      </div>

      <div class="demo-group">
        <h3>状態バリエーション</h3>
        <div class="demo-column">
          <FormField v-model="normalValue" label="通常状態" placeholder="通常の入力フィールド" />
          <FormField v-model="disabledValue" label="無効状態" placeholder="入力無効" disabled />
          <FormField v-model="readonlyValue" label="読み取り専用" placeholder="読み取り専用" readonly />
          <FormField v-model="requiredValue" label="必須項目" placeholder="必須入力" required />
        </div>
      </div>

      <div class="demo-group">
        <h3>エラー・ヘルプ表示</h3>
        <div class="demo-column">
          <FormField v-model="errorValue" label="エラー状態" placeholder="エラーのある入力" error="入力に誤りがあります" />
          <FormField v-model="helpValue" label="ヘルプあり" placeholder="ヘルプテキスト付き" help-text="こちらにヘルプメッセージを表示します" />
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>入力値確認</h2>
      <div class="values-display">
        <h3>現在の入力値</h3>
        <ul>
          <li>テキスト: {{ textValue }}</li>
          <li>メール: {{ emailValue }}</li>
          <li>パスワード: {{ passwordValue }}</li>
          <li>数値: {{ numberValue }}</li>
          <li>エラー値: {{ errorValue }}</li>
          <li>ヘルプ値: {{ helpValue }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import FormField from '~/components/atoms/FormField.vue'

// ボタン関連の状態
const buttonClickCount = ref(0)

// フォームフィールド関連の状態
const textValue = ref('')
const emailValue = ref('')
const passwordValue = ref('')
const numberValue = ref('')
const smallValue = ref('')
const mediumValue = ref('')
const largeValue = ref('')
const normalValue = ref('')
const disabledValue = ref('無効な値')
const readonlyValue = ref('読み取り専用の値')
const requiredValue = ref('')
const errorValue = ref('エラーのある値')
const helpValue = ref('')

const handleButtonClick = (): void => {
  buttonClickCount.value++
}
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.demo-section h1 {
  color: #1f2937;
  margin-bottom: 30px;
}

.demo-section h2 {
  color: #374151;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

.demo-group {
  margin-bottom: 30px;
}

.demo-group h3 {
  color: #6b7280;
  margin-bottom: 15px;
  font-size: 16px;
}

.demo-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.demo-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
}

.values-display {
  background: #f9fafb;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.values-display h3 {
  margin-top: 0;
  color: #374151;
}

.values-display ul {
  margin: 10px 0;
  padding-left: 20px;
}

.values-display li {
  margin-bottom: 5px;
  color: #6b7280;
  font-family: monospace;
}
</style>