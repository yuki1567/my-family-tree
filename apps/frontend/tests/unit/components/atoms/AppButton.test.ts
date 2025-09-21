import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/atoms/AppButton.vue'

describe('AppButton', () => {
  describe('基本機能', () => {
    it('正常にマウントされる', () => {
      const wrapper = mount(AppButton)
      expect(wrapper.exists()).toBe(true)
    })

    it('スロットコンテンツが表示される', () => {
      const wrapper = mount(AppButton, {
        slots: {
          default: 'ボタンテキスト',
        },
      })
      expect(wrapper.text()).toContain('ボタンテキスト')
    })

    it('クリックイベントが発火される', async () => {
      const wrapper = mount(AppButton)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
  })

  describe('Props', () => {
    it('variant propsが正しく適用される', () => {
      const wrapper = mount(AppButton, {
        props: { variant: 'danger' },
      })
      expect(wrapper.classes()).toContain('app-button--danger')
    })

    it('size propsが正しく適用される', () => {
      const wrapper = mount(AppButton, {
        props: { size: 'large' },
      })
      expect(wrapper.classes()).toContain('app-button--large')
    })

    it('type propsが正しく適用される', () => {
      const wrapper = mount(AppButton, {
        props: { type: 'submit' },
      })
      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('disabled状態が正しく適用される', () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      })
      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('app-button--disabled')
    })

    it('loading状態が正しく適用される', () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
      })
      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('app-button--loading')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })
  })

  describe('デフォルト値', () => {
    it('デフォルトpropsが正しく設定される', () => {
      const wrapper = mount(AppButton)
      expect(wrapper.classes()).toContain('app-button--primary')
      expect(wrapper.classes()).toContain('app-button--medium')
      expect(wrapper.attributes('type')).toBe('button')
    })
  })

  describe('イベントハンドリング', () => {
    it('disabled状態でクリックイベントが発火されない', async () => {
      const wrapper = mount(AppButton, {
        props: { disabled: true },
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('loading状態でクリックイベントが発火されない', async () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('正常な状態でクリックイベントのMouseEventが正しく渡される', async () => {
      const wrapper = mount(AppButton)
      const button = wrapper.find('button')
      await button.trigger('click')

      const clickEvents = wrapper.emitted('click')
      expect(clickEvents).toHaveLength(1)
      expect(clickEvents?.[0][0]).toBeInstanceOf(Event)
    })
  })

  describe('スタイルクラス', () => {
    it('loading状態でコンテンツが非表示になる', () => {
      const wrapper = mount(AppButton, {
        props: { loading: true },
        slots: {
          default: 'ボタンテキスト',
        },
      })
      const contentSpan = wrapper.find('span:not(.loading-spinner)')
      expect(contentSpan.classes()).toContain('content-hidden')
    })

    it('複数のクラスが同時に適用される', () => {
      const wrapper = mount(AppButton, {
        props: {
          variant: 'secondary',
          size: 'small',
          disabled: true,
        },
      })
      expect(wrapper.classes()).toContain('app-button')
      expect(wrapper.classes()).toContain('app-button--secondary')
      expect(wrapper.classes()).toContain('app-button--small')
      expect(wrapper.classes()).toContain('app-button--disabled')
    })
  })
})