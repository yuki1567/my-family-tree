import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import AppModal from '../../../components/layout/AppModal.vue'

// Teleport のモック
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    Teleport: {
      name: 'Teleport',
      props: ['to'],
      setup(props: any, { slots }: any) {
        return () => slots.default?.()
      },
    },
  }
})

describe('AppModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'テストモーダル',
  }

  beforeEach(() => {
    // body の overflow スタイルをリセット
    document.body.style.overflow = ''

    // キーボードイベントのモック関数をクリア
    vi.clearAllMocks()
  })

  describe('基本的な表示', () => {
    it('isOpen=trueの時にモーダルが表示される', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
      expect(wrapper.find('.modal-container').exists()).toBe(true)
      expect(wrapper.find('.modal-title').text()).toBe('テストモーダル')
    })

    it('isOpen=falseの時にモーダルが表示されない', () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          isOpen: false,
        },
      })

      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('titleが正しく表示される', () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          title: 'カスタムタイトル',
        },
      })

      expect(wrapper.find('.modal-title').text()).toBe('カスタムタイトル')
    })
  })

  describe('スロット', () => {
    it('デフォルトスロットの内容が表示される', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
        slots: {
          default: '<p>モーダルの内容</p>',
        },
      })

      expect(wrapper.find('.modal-body').html()).toContain('<p>モーダルの内容</p>')
    })

    it('footerスロットがある場合にフッターが表示される', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
        slots: {
          footer: '<button>OK</button><button>キャンセル</button>',
        },
      })

      expect(wrapper.find('.modal-footer').exists()).toBe(true)
      expect(wrapper.find('.modal-footer').html()).toContain('<button>OK</button>')
    })

    it('footerスロットがない場合にフッターが表示されない', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      expect(wrapper.find('.modal-footer').exists()).toBe(false)
    })
  })

  describe('閉じる機能', () => {
    it('閉じるボタンクリックでcloseイベントが発火される', async () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      await wrapper.find('.modal-close-button').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('closeOnOverlayClick=trueの時にオーバーレイクリックでcloseイベントが発火される', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          closeOnOverlayClick: true,
        },
      })

      await wrapper.find('.modal-overlay').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('closeOnOverlayClick=falseの時にオーバーレイクリックでcloseイベントが発火されない', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          closeOnOverlayClick: false,
        },
      })

      await wrapper.find('.modal-overlay').trigger('click')

      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('モーダルコンテナクリックではcloseイベントが発火されない', async () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      await wrapper.find('.modal-container').trigger('click')

      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('ESCキー対応', () => {
    it('closeOnEscape=trueの時にESCキーでcloseイベントが発火される', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          closeOnEscape: true,
        },
        attachTo: document.body,
      })

      // ESCキーイベントをシミュレート
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('closeOnEscape=falseの時にESCキーでcloseイベントが発火されない', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          closeOnEscape: false,
        },
        attachTo: document.body,
      })

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('isOpen=falseの時にESCキーでcloseイベントが発火されない', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          isOpen: false,
          closeOnEscape: true,
        },
        attachTo: document.body,
      })

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('アクセシビリティ', () => {
    it('適切なaria属性が設定されている', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      const container = wrapper.find('.modal-container')
      expect(container.attributes('role')).toBe('dialog')
      expect(container.attributes('aria-modal')).toBe('true')
      expect(container.attributes('aria-labelledby')).toMatch(/^modal-title-/)
    })

    it('タイトルに適切なIDが設定されている', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      const title = wrapper.find('.modal-title')
      const container = wrapper.find('.modal-container')

      expect(title.attributes('id')).toBeTruthy()
      expect(container.attributes('aria-labelledby')).toBe(title.attributes('id'))
    })

    it('閉じるボタンに適切なaria-labelが設定されている', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      const closeButton = wrapper.find('.modal-close-button')
      expect(closeButton.attributes('aria-label')).toBe('モーダルを閉じる')
    })
  })

  describe('レスポンシブ対応', () => {
    it('CSSクラスが正しく適用されている', () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      expect(wrapper.find('.modal-overlay').classes()).toContain('modal-overlay')
      expect(wrapper.find('.modal-container').classes()).toContain('modal-container')
    })
  })

  describe('体の制御', () => {
    it('モーダルが開いた時にbodyのoverflowがhiddenに設定される', async () => {
      const wrapper = mount(AppModal, {
        props: {
          ...defaultProps,
          isOpen: false,
        },
      })

      await wrapper.setProps({ isOpen: true })
      await wrapper.vm.$nextTick()

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('コンポーネントがアンマウントされた時にbodyのoverflowが復元される', async () => {
      const wrapper = mount(AppModal, {
        props: defaultProps,
      })

      wrapper.unmount()

      expect(document.body.style.overflow).toBe('')
    })
  })
})