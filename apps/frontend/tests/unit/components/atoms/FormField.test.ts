import FormField from '@/components/atoms/FormField.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('FormField', () => {
  describe('基本機能', () => {
    it('正常にマウントされる', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'Test Label' },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('inputタグが存在する', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'Test Label' },
      })
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('v-modelが正しく動作する', async () => {
      const wrapper = mount(FormField, {
        props: {
          'name': 'test-field',
          'label': 'Test Label',
          'modelValue': 'initial value',
          'onUpdate:modelValue': (value: string) =>
            wrapper.setProps({ modelValue: value }),
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('initial value')

      await input.setValue('new value')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
    })
  })

  describe('Props', () => {
    it('label propsが正しく表示される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'テスト用ラベル' },
      })
      expect(wrapper.find('label').text()).toContain('テスト用ラベル')
    })

    it('type propsが正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', type: 'email' },
      })
      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('placeholder propsが正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', placeholder: 'プレースホルダーテキスト' },
      })
      expect(wrapper.find('input').attributes('placeholder')).toBe(
        'プレースホルダーテキスト',
      )
    })

    it('required状態が正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', required: true, label: 'Required Field' },
      })
      expect(wrapper.find('input').attributes('required')).toBeDefined()
      expect(wrapper.find('.form-field-required').exists()).toBe(true)
      expect(wrapper.find('.form-field-required').text()).toBe('*')
    })
  })

  describe('エラー表示', () => {
    it('エラーメッセージが表示される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', errorMessage: 'エラーメッセージ' },
      })
      expect(wrapper.find('.form-field-error').exists()).toBe(true)
      expect(wrapper.find('.form-field-error').text()).toBe('エラーメッセージ')
      expect(wrapper.find('input').classes()).toContain(
        'form-field-input-error',
      )
    })
  })

  describe('デフォルト値', () => {
    it('デフォルトpropsが正しく設定される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'Test Label' },
      })
      const input = wrapper.find('input')

      expect(input.attributes('type')).toBe('text')
      expect(input.classes()).toContain('form-field-input')
      expect(input.element.value).toBe('')
    })
  })

  describe('ラベルとインプットの関連付け', () => {
    it('ラベルがある場合、インプットがラベル内にネストされる', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'Test Label' },
      })
      const label = wrapper.find('label')
      const input = label.find('input')

      expect(label.exists()).toBe(true)
      expect(input.exists()).toBe(true)
      expect(input.attributes('name')).toBe('test-field')
    })
  })

  describe('number型のmodelValue', () => {
    it('number型のmodelValueが正しく動作する', async () => {
      const wrapper = mount(FormField, {
        props: {
          'name': 'test-field',
          'label': 'Test Number Field',
          'modelValue': 123,
          'type': 'number' as const,
          'onUpdate:modelValue': (value: string | number): void => {
            wrapper.setProps({ modelValue: value })
          },
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('123')

      await input.setValue('456')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([456])
    })
  })
})
