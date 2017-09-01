/*

   a SortedMap is a javascript Array whose elements are already sorted in some way.

   important terms:

   - `key` & `elementToKey` : every element of the Array should have an unique key
     which is determined by calling elementToKey(<element>)

   - `compareKey`: the way two keys are compared, following the same protocol as

     `compareFunction` in `Array.prototype.sort(<compareFunction>)`

   - `smContext`: an Object that at least has shaped `{ elementToKey, compareKey }`.

   assumption:

   - It is assumed that a SortedMap will not contain any `undefined` value,
     and if any edit attempt end up returning `undefined`,
     the corresponding element is removed from SortedMap

 */

/*
   the default SortedMap context:
   assume that every element has a 'key' property,

   basically generalComparator works on any value that supports
   `===` and `<` and `>`, check its definition in ./array-ops.js for details.

 */

import { insertAt, generalComparator } from './array-ops'

const defaultSmContext = {
  elementToKey: v => v.key,
  compareKey: generalComparator,
}

/*
   returns `null` only when the given SortedMap (Array) is empty,

   otherwise:

   - returns the index where 'key' is expected.
   - it's guaranteed that in this case the return value is always in range
   - if one wishes to insert a value, the insertion point could be before or
     after the index returned by this function, one should compare key with
     the element under index to tell:

     - if key > element.key, insertion point is right after the element
     - if key < element.key, insertion point is right before the element

*/
const locate = smContext => key => xs => {
  if (xs.length === 0)
    return null

  const {elementToKey, compareKey} = smContext

  // INVARIANT: l <= r
  const find = (l,r) => {
    if (l === r)
      return l
    // now that the range contains at least 2 elements,
    // r > mid must hold.
    const mid = Math.floor((l+r)/2)
    const cmpResult = compareKey(elementToKey(xs[mid]), key)

    if (cmpResult === 0) {
      // xs[mid].key === key
      return mid
    }

    if (cmpResult < 0) {
      // xs[mid].key < key
      if (mid+1 <= r)
        return find(mid+1,r)
      /*
         mid+1 > r ==> mid >= r
         which contradicts the fact that r > mid
       */
      throw new Error('unreachable: mid+1 > r')
    } else {
      // xs[mid].key > key
      if (l <= mid-1)
        return find(l,mid-1)
      /*
         - l > mid-1 ==> l >= mid
         - l > mid is impossible
         - l === mid

         now that l === r is impossible,
         it must be the case where l+1 === r
       */
      return mid
    }
  }
  return find(0,xs.length-1)
}

/*
   modify(<smContext>)(<key>,<modifier>)(<SortedMap>) => SortedMap

   modifies the SortedMap as if we are using modifyObject on an Object.

   - smContext: {elementToKey, compareKey} (see comment on top)

   - modifier is called like: `modifier(<current val>, <key>, <isValAssigned>)`

     - <current val> is the current element in Array
       (`undefined` if it's a fresh place)
     - <isValAssigned>: whether the value is assigned. originally this is to
       keep API consistent with that of modifyObject, but since
       we have the assumption that SortedMap can't have `undefined` members,
       one could just test <current val> for getting the same info.

   - it's very important that modifier must either return `undefined` or return
     a value `val` which satisfies:

     `compareKey(elementToKey(val), key) === 0`

     otherwise SortedMap's properties will break.

   - modify **does not** provide any checks to ensure the key is preserved,
     but one can have their modifier decorated by SortedMap.guardModifier,
     which checks for this key-preseving property if the return value is not 'undefined'.

 */
const modify = (smContext=defaultSmContext) => (key, modifier) => xs => {
  const {elementToKey, compareKey} = smContext

  if (xs.length === 0) {
    const isValAssigned = false
    const newVal = modifier(undefined,key,isValAssigned)
    if (typeof newVal !== 'undefined') {
      return insertAt(0,newVal)(xs)
    } else {
      return xs
    }
  }

  const ind = locate(smContext)(key)(xs)
  const cmpResult = compareKey(elementToKey(xs[ind]), key)
  const isValAssigned = cmpResult === 0
  if (isValAssigned) {
    const val = xs[ind]
    const newVal = modifier(val,key,isValAssigned)

    if (typeof newVal === 'undefined') {
      return [
        ...xs.slice(0,ind),
        ...xs.slice(ind+1,xs.length),
      ]
    } else {
      if (val === newVal)
        return xs
      const ys = [...xs]
      ys[ind] = newVal
      return ys
    }
  }
  const newVal = modifier(undefined,key,isValAssigned)
  if (typeof newVal === 'undefined')
    return xs

  if (cmpResult < 0) {
    // xs[ind].key < key
    return insertAt(ind+1,newVal)(xs)
  } else {
    return insertAt(ind,newVal)(xs)
  }
}

const find = (smContext=defaultSmContext) => key => xs => {
  if (xs.length === 0)
    return undefined
  const ind = locate(smContext)(key)(xs)
  const {elementToKey, compareKey} = smContext
  const cmpResult = compareKey(elementToKey(xs[ind]), key)
  return cmpResult === 0 ? xs[ind] : undefined
}

/*
   decorate a modifier to check for key-preserving property
 */
const guardModifier = (smContext=defaultSmContext) => {
  const {elementToKey, compareKey} = smContext
  return modifier => (val,key,isValAssigned) => {
    const newVal = modifier(val,key,isValAssigned)
    if (typeof newVal === 'undefined')
      return newVal
    if (compareKey(elementToKey(newVal), key) !== 0) {
      console.error(`invariant violated: modifier have changed a key`)
      return val
    } else {
      return newVal
    }
  }
}

class SortedMap {
  static defaultContext = defaultSmContext

  static modify = modify

  static find = find
  static guardModifier = guardModifier

  static withContext = smContext =>
    class SortedMapWithContext {
      static context = smContext
      static modify = modify(smContext)
      static find = find(smContext)
      static guardModifier = guardModifier(smContext)
    }
}

export { SortedMap }
