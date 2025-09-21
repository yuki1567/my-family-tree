import App from '@/app.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('App.vue', () => {
  it('正常にマウントできるか', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('app要素が存在するか', () => {
    const wrapper = mount(App)
    const appElement = wrapper.find('#app')
    expect(appElement.exists()).toBe(true)
  })

  it('NuxtPageコンポーネントが含まれているか', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          NuxtPage: true,
        },
      },
    })
    expect(wrapper.findComponent({ name: 'NuxtPage' }).exists()).toBe(true)
  })
})
