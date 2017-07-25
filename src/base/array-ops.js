/*
   Array-related functions

 */

// "modifyArray(index,f)(xs)" keeps "xs" intact and returns a new array
// whose element on "index" is modified by feeding original value to "f".
// if "index" is out of range, "xs" itself is returned.
const modifyArray = (index, f) => {
  if (typeof index !== 'number')
    console.error('index is not a number')
  if (typeof f !== 'function')
    console.error('modifier is not a function')
  return xs => {
    if (index < 0 || index >= xs.length)
      return xs
    const ys = [...xs]
    const v = ys[index]
    const newV = f(v)
    if (v !== newV) {
      ys[index] = newV
      return ys
    } else {
      return xs
    }
  }
}

// insert a value at `ind` of an Array (functionally)
const insertAt = (ind, val) => xs =>
  [
    ...xs.slice(0,ind),
    val,
    ...xs.slice(ind,xs.length),
  ]

const scan = (xs, acc, zero) => {
  const ys = new Array(xs.length+1)
  ys[0] = zero
  for (let i=0; i<xs.length; ++i) {
    ys[i+1] = acc(ys[i],xs[i])
  }
  return ys
}

export {
  modifyArray,
  insertAt,

  scan,
}
