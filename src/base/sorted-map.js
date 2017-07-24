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

// returns the index where 'key' is expected
// returns null only when the given Array is empty
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

const insertAt = (ind, val) => xs =>
  [
    ...xs.slice(0,ind),
    val,
    ...xs.slice(ind,xs.length),
  ]

const modify = smContext => (key, modifier) => xs => {
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

class SortedMap {
  static modify = modify
}

export { SortedMap }
