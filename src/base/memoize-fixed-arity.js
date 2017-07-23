// `deepWrite(map)([k1,k2,k3...])(value)`
// - assigns `value` to `map.get(k1).get(k2).get(k3)...`.
// - new Map objects are created if some keys are missing along the path.
// - INVARIANT: keys.length >= 1
const deepWrite = map => keys => value => {
  if (keys.length === 0) {
    console.error(`invariant violation: empty key array`)
    return undefined
  }
  if (keys.length === 1) {
    const [key] = keys
    map.set(key,value)
    return map
  } else {
    const [key, ...ks] = keys
    const subMap = map.has(key) ? map.get(key) : new Map()
    const subMapAfter = deepWrite(subMap)(ks)(value)
    map.set(key,subMapAfter)
    return map
  }
}

const deepLookup = map => keys => {
  if (keys.length === 0) {
    return map
  }

  const [key, ...restKeys] = keys
  return map.has(key) ?
    deepLookup(map.get(key))(restKeys) :
    undefined
}

// when the arity of a pure func is fixed,
// it can be memoized by using multiple-layers of Maps
const memoizeFixedArity = arity => func => {
  if (typeof arity !== 'number' || arity <= 0) {
    console.warn(`invariant violation: arity should be a positive number`)
    // in this case we just leave the function intact and return it.
    return func
  }
  let cache = new Map()

  return (...args) => {
    if (args.length !== arity) {
      console.warn(`arity mismatched, skipping cache lookup.`)
      return func(...args)
    }

    const cached = deepLookup(cache)(args)
    if (typeof cached === 'undefined') {
      const result = func(...args)
      cache = deepWrite(cache)(args)(result)
      return result
    } else {
      return cached
    }
  }
}

export { memoizeFixedArity }
