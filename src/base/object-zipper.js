/*
   ObjectZipper structure:

   {
     type: 'zipper',
     whole: <the object it presents>,
     focus: null or a {key[, val]} pair,
   }

   - if `focus` is null, then `whole` represents the object

   - otherwise, the `{key,val} = focus` should be the single source of truth
     of the object's value under key `key`.

   - when `focus.val` is `undefined`, there are two situations:

     - either val is assigned value `undefined`
     - or val is not assigned at all

     this is exactly the situation like "obj[key] = undefined",
     so having a non-null focus can perfectly keep track of these cases.

   - focus.key, if present, is always normalized using key.toString()
 */
import { modifyObject } from './common'

const normKey = rawKey => rawKey.toString()

// load a pair (focus) from object, key must be normalized strings
const loadPair = key => obj => {
  if (key in obj) {
    return {key, val: obj[key]}
  } else {
    return {key}
  }
}

// unload a pair onto object, key must be normalized strings
const unloadPair = pair => obj => {
  const {key} = pair
  if ('val' in pair) {
    // val is assigned, which then always
    // overwrites whatever in the object
    // using modifyObject to avoid unnecessary overwrites
    return modifyObject(key,() => pair.val)(obj)
  } else {
    // val is not assigned
    if (key in obj) {
      // need to remove the value
      const {[key]: _ignored, ...rest} = obj
      return rest
    } else {
      return obj
    }
  }
}

const fromObject = obj => ({
  type: 'zipper',
  whole: obj,
  focus: null,
})

const toObject = ozp => {
  const {whole, focus} = ozp
  if (focus === null)
    return whole
  return unloadPair(focus)(whole)
}

// make sure we are focusing on a key
const focusKey = key => ozp => {
  const {whole, focus} = ozp
  // no need of changing focus if it's already the focus
  if (focus !== null && key === focus.key)
    return ozp
  const whole1 =
    focus === null ?
      whole :
      unloadPair(focus)(whole)

  // not using modifyObject here
  // at this point the focus must be changed anyways.
  return {
    ...ozp,
    whole: whole1,
    focus: loadPair(key)(whole1),
  }
}

const modifyVal = (modifier, removeUndefined = false) => ozp => {
  const {focus} = ozp
  const {key,val} = focus
  const isValAssigned = 'val' in focus
  const newVal = modifier(val,key,isValAssigned)
  if (typeof newVal === 'undefined' && removeUndefined) {
    if (isValAssigned) {
      return {
        ...ozp,
        focus: {key},
      }
    } else {
      return ozp
    }
  }

  if (newVal === val)
    return ozp

  return {
    ...ozp,
    focus: {key, val: newVal},
  }
}

class ObjectZipper {
  static fromObject = fromObject
  static toObject = toObject

  static modify = (rawKey, modifier, removeUndefined = false) => ozp => {
    const key = normKey(rawKey)
    const ozp1 = focusKey(key)(ozp)
    const ozp2 = modifyVal(modifier,removeUndefined)(ozp1)
    return ozp2
  }

  static withZipped = funcOzp => obj =>
    toObject(funcOzp(fromObject(obj)))
}

export { ObjectZipper }
