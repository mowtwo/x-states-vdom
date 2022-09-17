export const not_in = (key, map) => !Reflect.has(map, key)

export const is_fn = (fn) => typeof fn === 'function'
