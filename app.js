import { effect } from "./effect.js"
import { is_fn } from "./helper.js"
import { mount, render as vnodeRender } from "./render.js"

export const is_custom_comp = (tag) => tag === '$$'
export const render = (mult_vnode) => {
  const { tag, children } = mult_vnode
  if (is_custom_comp(tag)) {
    return vnodeRender(children)
  } else {
    return vnodeRender(mult_vnode)
  }
}
export const createApp = (comp) => {
  const el = is_fn(comp) ? render({
    ...comp(),
    name: comp.name
  }) : render(comp)
  return {
    mount(parent) {
      return mount(el, parent)
    }
  }
}
