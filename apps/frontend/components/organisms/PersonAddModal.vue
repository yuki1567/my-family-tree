<template>
  <AppModal @close="closeModal">
    <form class="person-form" @submit.prevent="submitForm">
      <div class="field-row">
        <div class="field-columns">
          <FormField
            v-model="form.name"
            label="氏名"
            name="name"
            placeholder="山田 太郎"
            :error-message="errors.name"
          />
          <FormField
            v-model="form.gender"
            label="性別"
            name="gender"
            type="radio"
            :options="genderOptions"
            :error-message="errors.gender"
          />
        </div>
      </div>

      <div class="field-row">
        <div class="field-columns">
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

      <div class="field-row">
        <FormField
          v-model="form.birthPlace"
          label="出生地"
          name="birthPlace"
          placeholder="東京都渋谷区"
          :error-message="errors.birthPlace"
        />
      </div>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="closeModal">
        キャンセル
      </AppButton>
      <AppButton
        variant="primary"
        type="submit"
        :is-loading="isLoading"
        @click="submitForm"
      >
        追加
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/atoms/FormField.vue'
import AppModal from '@/components/layout/AppModal.vue'
import { usePersonValidation } from '@/composables/useValidation'
import type { PersonForm } from '@/types/person'
import { INITIAL_PERSON_FORM } from '@/types/person'
import { UserIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { reactive, ref } from 'vue'

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
const submitForm = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 空文字列をundefinedに変換してから送信
    const cleanedForm: PersonForm = {}

    if (form.name && form.name !== '') cleanedForm.name = form.name
    if (form.gender) cleanedForm.gender = form.gender
    if (form.birthDate && form.birthDate !== '')
      cleanedForm.birthDate = form.birthDate
    if (form.deathDate && form.deathDate !== '')
      cleanedForm.deathDate = form.deathDate
    if (form.birthPlace && form.birthPlace !== '')
      cleanedForm.birthPlace = form.birthPlace

    // 親コンポーネントにデータを渡す
    emit('save', cleanedForm)
  } finally {
    isLoading.value = false
  }
}

/**
 * モーダルクローズ処理
 */
const closeModal = (): void => {
  emit('close')
}
</script>

<style scoped>
.person-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.field-row {
  display: flex;
  flex-direction: column;
}

.field-columns {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

/* レスポンシブ対応 */
@media (min-width: 768px) {
  .field-columns {
    flex-direction: row;
  }

  .field-columns > * {
    flex: 1;
  }
}
</style>
