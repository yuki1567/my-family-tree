<template>
  <AppModal @close="closeModal">
    <form class="person-form" @submit.prevent="submitForm">
      <div class="field-row">
        <FormField
          v-model="form.name"
          label="氏名"
          name="name"
          placeholder="山田 太郎"
          :error-message="errors.name"
        />
      </div>

      <div class="field-row">
        <FormField
          v-model="form.gender"
          label="性別"
          name="gender"
          type="radio"
          :options="genderOptions"
          :error-message="errors.gender"
        />
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
      <AppButton variant="primary" :is-loading="isLoading" @click="submitForm">
        追加
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { UserIcon, UsersIcon } from '@heroicons/vue/24/outline'
import type { ErrorResponse } from '@shared/api/common'
import { type Component, reactive, ref, watch } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/atoms/FormField.vue'
import AppModal from '@/components/layout/AppModal.vue'
import { usePersonValidation } from '@/composables/useValidation'
import type { PersonForm, ValidationErrors } from '@/types/person'
import { INITIAL_PERSON_FORM } from '@/types/person'

type RadioOption = {
  label: string
  value: string
  icon?: Component
  colorType: 'gender' | 'relationship'
}

type Props = {
  error?: ErrorResponse
}

type Emits = {
  close: []
  save: [data: PersonForm]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// フォームデータ
const form = reactive<PersonForm>({ ...INITIAL_PERSON_FORM })

// バリデーション機能
const { errors, validateForm } = usePersonValidation(form)

// ローディング状態
const isLoading = ref(false)

const isValidationErrorField = (
  field: string
): field is keyof ValidationErrors => {
  return field in errors
}

// サーバーエラーを監視してフォームのエラーに反映
watch(
  () => props.error,
  (error) => {
    if (error?.details) {
      error.details.forEach((detail) => {
        const field = detail.field
        if (isValidationErrorField(field)) {
          errors[field] = detail.code
        }
      })
    }
  }
)

// 性別オプション（アイコン付き）
const genderOptions: RadioOption[] = [
  {
    label: '男性',
    value: 'male',
    icon: UserIcon,
    colorType: 'gender',
  },
  {
    label: '女性',
    value: 'female',
    icon: UsersIcon,
    colorType: 'gender',
  },
  {
    label: '不明',
    value: 'unknown',
    icon: UserIcon,
    colorType: 'gender',
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
    const cleanedForm: PersonForm = {
      gender: form.gender,
    }

    if (form.name && form.name !== '') cleanedForm.name = form.name
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
  flex-direction: row;
  gap: 1.6rem;
}

@media (max-width: 767px) {
  .field-columns {
    flex-direction: column;
  }

  .field-columns > * {
    flex: 1;
  }
}
</style>
