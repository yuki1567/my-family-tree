import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '@/components/atoms/FormField.vue'

describe('FormField', () => {
  describe('基本機能', () => {
    it('正常にマウントされる', () => {
      const wrapper = mount(FormField)
      expect(wrapper.exists()).toBe(true)
    })

    it('inputタグが存在する', () => {
      const wrapper = mount(FormField)
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('v-modelが正しく動作する', async () => {
      const wrapper = mount(FormField, {
        props: {
          modelValue: 'initial value',
          'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
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
        props: { label: 'テスト用ラベル' },
      })
      expect(wrapper.find('label').text()).toContain('テスト用ラベル')
    })

    it('type propsが正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { type: 'email' },
      })
      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('placeholder propsが正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { placeholder: 'プレースホルダーテキスト' },
      })
      expect(wrapper.find('input').attributes('placeholder')).toBe('プレースホルダーテキスト')
    })

    it('disabled状態が正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { disabled: true },
      })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
      expect(wrapper.find('input').classes()).toContain('form-field__input--disabled')
    })

    it('readonly状態が正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { readonly: true },
      })
      expect(wrapper.find('input').attributes('readonly')).toBeDefined()
      expect(wrapper.find('input').classes()).toContain('form-field__input--readonly')
    })

    it('required状態が正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { required: true, label: 'Required Field' },
      })
      expect(wrapper.find('input').attributes('required')).toBeDefined()
      expect(wrapper.find('.form-field__required').exists()).toBe(true)
      expect(wrapper.find('.form-field__required').text()).toBe('*')
    })

    it('size propsが正しく適用される', () => {
      const wrapper = mount(FormField, {
        props: { size: 'large' },
      })
      expect(wrapper.find('input').classes()).toContain('form-field__input--large')
    })
  })

  describe('エラー表示', () => {
    it('エラーメッセージが表示される', () => {
      const wrapper = mount(FormField, {
        props: { error: 'エラーメッセージ' },
      })
      expect(wrapper.find('.form-field__error').exists()).toBe(true)
      expect(wrapper.find('.form-field__error').text()).toBe('エラーメッセージ')
      expect(wrapper.find('input').classes()).toContain('form-field__input--error')
    })

    it('エラーがある場合、ヘルプテキストは表示されない', () => {
      const wrapper = mount(FormField, {
        props: {
          error: 'エラーメッセージ',
          helpText: 'ヘルプテキスト',
        },
      })
      expect(wrapper.find('.form-field__error').exists()).toBe(true)
      expect(wrapper.find('.form-field__help').exists()).toBe(false)
    })
  })

  describe('ヘルプテキスト', () => {
    it('ヘルプテキストが表示される', () => {
      const wrapper = mount(FormField, {
        props: { helpText: 'ヘルプテキスト' },
      })
      expect(wrapper.find('.form-field__help').exists()).toBe(true)
      expect(wrapper.find('.form-field__help').text()).toBe('ヘルプテキスト')
    })

    it('エラーもヘルプテキストもない場合、どちらも表示されない', () => {
      const wrapper = mount(FormField)
      expect(wrapper.find('.form-field__error').exists()).toBe(false)
      expect(wrapper.find('.form-field__help').exists()).toBe(false)
    })
  })

  describe('イベントハンドリング', () => {
    it('input イベントが発火される', async () => {
      const wrapper = mount(FormField)
      const input = wrapper.find('input')
      await input.trigger('input')
      expect(wrapper.emitted('input')).toHaveLength(1)
    })

    it('focus イベントが発火される', async () => {
      const wrapper = mount(FormField)
      const input = wrapper.find('input')
      await input.trigger('focus')
      expect(wrapper.emitted('focus')).toHaveLength(1)
    })

    it('blur イベントが発火される', async () => {
      const wrapper = mount(FormField)
      const input = wrapper.find('input')
      await input.trigger('blur')
      expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    it('focus状態でスタイルクラスが適用される', async () => {
      const wrapper = mount(FormField)
      const input = wrapper.find('input')

      await input.trigger('focus')
      expect(input.classes()).toContain('form-field__input--focused')

      await input.trigger('blur')
      expect(input.classes()).not.toContain('form-field__input--focused')
    })
  })

  describe('デフォルト値', () => {
    it('デフォルトpropsが正しく設定される', () => {
      const wrapper = mount(FormField)
      const input = wrapper.find('input')

      expect(input.attributes('type')).toBe('text')
      expect(input.classes()).toContain('form-field__input--medium')
      expect(input.element.value).toBe('')
    })
  })

  describe('フィールドID', () => {
    it('name propsがある場合、フィールドIDに使用される', () => {
      const wrapper = mount(FormField, {
        props: { name: 'test-field', label: 'Test Label' },
      })
      const input = wrapper.find('input')
      const label = wrapper.find('label')

      expect(input.attributes('id')).toBe('test-field')
      expect(label.attributes('for')).toBe('test-field')
    })

    it('name propsがない場合、ランダムIDが生成される', () => {
      const wrapper = mount(FormField, {
        props: { label: 'Test Label' },
      })
      const input = wrapper.find('input')
      const label = wrapper.find('label')

      const fieldId = input.attributes('id')
      expect(fieldId).toBeTruthy()
      expect(label.attributes('for')).toBe(fieldId)
    })
  })

  describe('number型のmodelValue', () => {
    it('number型のmodelValueが正しく動作する', async () => {
      const wrapper = mount(FormField, {
        props: {
          modelValue: 123,
          type: 'number',
          'onUpdate:modelValue': (value: number) => wrapper.setProps({ modelValue: value }),
        },
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('123')

      await input.setValue('456')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([456])
    })
  })
})