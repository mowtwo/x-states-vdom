import { not_in } from "./helper.js"
import { empty_tag, not_function, t_err } from "./err.js"
import { effect, is_state, state } from "./effect.js"
import { is_custom_comp, render as multRender } from "./app.js"

export const element = (tag, options, children) => {
  return {
    tag, options, children
  }
}

const hooks_must_arr = (name) => t_err(`hook:${name} must be a array`)

const parse_events = (events, el, hooks) => {
  const on = (type, handle) => {
    el.addEventListener(type, handle, false)
    return () => {
      el.removeEventListener(type, handle, false)
    }
  }
  const keys = Object.keys(events)
  for (const key of keys) {
    const handle = events[key]
    if (typeof handle !== 'function') {
      return not_function(String(handle))
    }
    const remove = on(key.slice(2), handle)
    let beforeUnmount = hooks['beforeUnmount']
    if (not_in('beforeUnmount', hooks)) {
      beforeUnmount = hooks['beforeUnmount'] = []
    }
    if (!Array.isArray(beforeUnmount)) {
      return hooks_must_arr("beforeUnmount")
    }
    beforeUnmount.push(() => {
      remove()
    })
  }
}

const parse_props = (props, el, hooks) => {
  const keys = Object.keys(props)
  const events = {}
  for (const key of keys) {
    const item = props[key]
    const lowerKey = key.toLocaleLowerCase()
    if (lowerKey.startsWith('on')) {
      events[key.toLowerCase()] = item
      continue
    }
    if (is_state(item)) {
      const updateAttrs = effect(() => {
        el.setAttribute(lowerKey, item())
      })
      updateAttrs()
    } else {
      el.setAttribute(lowerKey, item)
    }
  }
  parse_events(events, el, hooks)
}

const handle_hooks = (hooks, name) => {
  if (!hooks) {
    return
  }
  if (!Array.isArray(hooks)) {
    return hooks_must_arr(name)
  }
  const keys = Object.keys(hooks)
  for (const key of keys) {
    const fn = hooks[key]
    if (typeof fn !== 'function') {
      return not_function(fn)
    }
    fn()
  }
}

export const mount = (el, parent, hooks) => {
  const {
    beforeMount = [],
    mounted = []
  } = hooks ?? {}
  handle_hooks(beforeMount)
  parent.appendChild(el)
  handle_hooks(mounted)
}

const unmount = (el, parent, hooks) => {
  const {
    beforeUnmount = [],
    unMounted = []
  } = hooks ?? {}
  handle_hooks(beforeUnmount)
  parent.removeChild(el)
  handle_hooks(unMounted)
}

const render_children = (children, el) => {
  if (!children) {
    return
  }
  if (!Array.isArray(children)) {
    const child_el = render(children)
    let hooks = {}
    if (typeof children === 'object') {
      hooks = children?.options?.hooks ?? {}
    }
    mount(child_el, el, hooks)
  } else {
    for (const child of children) {
      render_children(child, el)
    }
  }
}

export const render = (vnode) => {
  if (is_state(vnode)) {
    const text_el = document.createTextNode('')
    const updaText = effect(() => {
      text_el.textContent = vnode()
    })
    updaText()
    return text_el
  }

  if (typeof vnode === 'string') {
    return render({
      tag: 'text',
      children: vnode
    })
  }
  const { tag, options, children } = vnode ?? {}
  if (!tag) {
    return empty_tag()
  }

  if (is_custom_comp(tag)) {
    multRender(vnode)
  }

  if (tag === 'state_text') {
    const text_el = document.createTextNode('')
    const updaText = effect(() => {
      text_el.textContent = children()
    })
    updaText()
    return text_el
  }

  if (tag === 'text') {
    return document.createTextNode(children ?? '')
  }

  const { props = {}, hooks = {} } = options ?? {}
  const el = document.createElement(tag)
  parse_props(props, el, hooks)
  render_children(children, el)
  return el
}

export const state_text = (string) => {
  const [get] = state(string)
  return {
    tag: 'state_text',
    states,
    children: get
  }
}
