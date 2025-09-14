import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './app.vue'

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
