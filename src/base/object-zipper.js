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
    // if they are different
    if (pair.val !== obj[key]) {
      return {
        ...obj,
        [key]: pair.val,
      }
    } else {
      return obj
    }
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
  if (focus !== null && key === focus.key)
    return ozp
  const whole1 =
    focus === null ?
      whole :
      unloadPair(focus)(whole)

  return {
    ...ozp,
    whole: whole1,
    focus: loadPair(key)(whole1),
  }
}

const modifyVal = (modifier, removeUndefined = false) => ozp => {
  const {focus} = ozp
  const {key,val} = focus
  const newVal = modifier(val)
  if (typeof newVal === 'undefined' && removeUndefined) {
    if ('val' in focus) {
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
}

export { ObjectZipper }
