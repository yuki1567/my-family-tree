<template>
  <AppModal @close="handleClose">
    <h2 class="modal-title">
      人物の追加
    </h2>

    <form
      class="person-form"
      @submit.prevent="handleSubmit"
    >
      <div class="form-row">
        <FormField
          v-model="form.name"
          label="氏名"
          name="name"
          placeholder="山田 太郎"
          :error-message="errors.name"
        />
      </div>

      <div class="form-row">
        <FormField
          v-model="form.gender"
          label="性別"
          name="gender"
          type="radio"
          :options="genderOptions"
          :error-message="errors.gender"
        />
      </div>

      <div class="form-row">
        <div class="form-row-group">
          <FormField
            v-model="form.birthDate"
            label="生年月日"
            name="birthDate"
            type="date"
            :error-message="errors.birthDate"
          />
          <FormField
            v-model="form.deathDate"
            label="没年月日"
            name="deathDate"
            type="date"
            :error-message="errors.deathDate"
          />
        </div>
      </div>

      <div class="form-row">
        <FormField
          v-model="form.birthPlace"
          label="出生地"
          name="birthPlace"
          placeholder="東京都渋谷区"
          :error-message="errors.birthPlace"
        />
      </div>

      <div class="form-row">
        <FormField
          v-model="form.memo"
          label="メモ"
          name="memo"
          placeholder="備考やエピソードなど"
          :error-message="errors.memo"
        />
      </div>
    </form>

    <template #footer>
      <AppButton
        variant="secondary"
        @click="handleClose"
      >
        キャンセル
      </AppButton>
      <AppButton
        variant="primary"
        type="submit"
        :is-loading="isLoading"
        @click="handleSubmit"
      >
        保存
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { UserIcon, UsersIcon } from '@heroicons/vue/24/outline'
import AppModal from '@/components/layout/AppModal.vue'
import FormField from '@/components/atoms/FormField.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { usePersonValidation } from '@/composables/useValidation'
import type { PersonForm } from '@/types/person'
import { INITIAL_PERSON_FORM } from '@/types/person'

type Emits = {
  close: []
  save: [data: PersonForm]
}

const emit = defineEmits<Emits>()

// フォームデータ
const form = reactive<PersonForm>({ ...INITIAL_PERSON_FORM })

// バリデーション機能
const { errors, validateForm } = usePersonValidation(form)

// ローディング状態
const isLoading = ref(false)

// 性別オプション（アイコン付き）
const genderOptions = [
  {
    label: '男性',
    value: 'male',
    icon: UserIcon,
  },
  {
    label: '女性',
    value: 'female',
    icon: UsersIcon,
  },
]

/**
 * フォーム送信処理
 */
const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 空文字列をundefinedに変換してから送信
    const cleanedForm: PersonForm = {}

    if (form.name && form.name !== '') cleanedForm.name = form.name
    if (form.gender) cleanedForm.gender = form.gender
    if (form.birthDate && form.birthDate !== '') cleanedForm.birthDate = form.birthDate
    if (form.deathDate && form.deathDate !== '') cleanedForm.deathDate = form.deathDate
    if (form.birthPlace && form.birthPlace !== '') cleanedForm.birthPlace = form.birthPlace
    if (form.memo && form.memo !== '') cleanedForm.memo = form.memo

    // 親コンポーネントにデータを渡す
    emit('save', cleanedForm)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * モーダルクローズ処理
 */
const handleClose = (): void => {
  emit('close')
}
</script>

<style scoped>
.modal-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2.4rem;
}

.person-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
}

/* レスポンシブ対応 */
@media (max-width: 767px) {
  .form-row-group {
    grid-template-columns: 1fr;
  }
}
</style>
