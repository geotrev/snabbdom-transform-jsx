import { forEach, kebabToCamel } from "./utilities.js"

const propsToUpdate = [
  {
    reg: /^aria-/,
    module: "attrs",
  },
  {
    reg: /^data-/,
    module: "dataset",
    mutate: (key) => kebabToCamel(key.slice(5)),
  },
  {
    reg: /^on-/,
    module: "on",
    mutate: (key) => key.split("-")[1],
  },
  {
    reg: /^hook-/,
    module: "hook",
    mutate: (key) => key.split("-")[1],
  },
  {
    reg: /^className$/,
    module: "props",
  },
]

/**
 * Converts JSX props to valid snabbdom vnode modules.
 * @param {Object} vnode
 * @returns {Object} vnode
 */
export function transform(vnode) {
  if (vnode.data) {
    const propKeys = Object.keys(vnode.data)
    const deletions = []

    forEach(propsToUpdate, (propInfo) => {
      const matches = propKeys.filter((key) => propInfo.reg.test(key))
      if (!matches.length) return

      forEach(matches, (propKey) => {
        const { module, mutate } = propInfo
        const moduleKey = mutate ? mutate(propKey) : propKey
        const value = vnode.data[propKey]

        if (vnode.data[module]) {
          vnode.data[module][moduleKey] = value
        } else {
          vnode.data[module] = { [moduleKey]: value }
        }

        deletions.push(propKey)
      })
    })

    forEach(deletions, (key) => delete vnode.data[key])
  }

  if (Array.isArray(vnode.children)) {
    forEach(vnode.children, transform)
  }

  return vnode
}
