import { effect_ctx } from "./ctx.js"
import { not_function } from "./err.js"
import { is_fn } from "./helper.js"

const state_symbol = Symbol("is_state")

export const is_state = (obj) => {
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    return false
  }
  return Reflect.get(obj, state_symbol) ?? false
}

export const effect = (fn, { immediate = false } = {}) => {
  console.log(fn)
  if (!is_fn(fn)) {
    return not_function(fn)
  }
  const runner = () => {
    fn()
  }
  effect_ctx.current_effect = runner
  if (immediate) {
    runner()
  }
  return runner
}

export const state = (initValue) => {
  let cache = { value: initValue }
  const effects = new Set()
  const getter = () => {
    if (typeof effect_ctx.current_effect === 'function') {
      effects.add(effect_ctx.current_effect)
    }

    return cache.value
  }

  const setter = (set) => {
    let value = set
    if (is_fn(set)) {
      value = set(cache.value)
    }
    cache.value = value
    for (const fn of effects) {
      if (typeof fn === 'function') {
        fn()
      }
    }
  }

  Reflect.set(getter, state_symbol, true)
  return [getter, setter]
}
