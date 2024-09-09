import _ from 'lodash'

/*

   Despite that JSON Objects are intentionally unordered, we can still
   normalize it by re-inserting every pair in sorted order - as we assume
   there is no non-deterministic factor involved in object property insertion,
   we will always get the object whose `JSON.stringify` is always the same.

 */
const normalizeData = val => {
  if (val === null || typeof val !== 'object')
    return val

  if (Array.isArray(val)) {
    return val.map(normalizeData)
  } else {
    const keys = Object.keys(val).sort()
    return _.fromPairs(keys.map(k => [k, normalizeData(val[k])]))
  }
}

export * from '../base'
export * from './redux'
export * from './react-redux'
export * from './remodel'

export {
  normalizeData,
}
