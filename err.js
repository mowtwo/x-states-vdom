export const err = (log, Err = Error) => {
  throw new Err(log)
}

export const t_err = (log) => err(log, TypeError)

export const empty_tag = () => t_err("tag is undefined")

export const not_function = (fn) => t_err(`${fn} is not function`)

export const comp_none_name = () => err(`Component options must be had a name`)
