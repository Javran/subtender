/*
   mean to be a module without any dependencies
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
    ys[index] = f(v)
    return ys
  }
}

const modifyObject = (propName, f, removeUndefined = false) => {
  if (typeof f !== 'function')
    console.error('modifier is not a function')

  return obj => {
    const val = obj[propName]
    const newVal = f(val)
    if (typeof newVal === 'undefined' && removeUndefined) {
      const newObj = {...obj}
      delete newObj[propName]
      return newObj
    } else {
      return ({
        ...obj,
        [propName]: newVal,
      })
    }
  }
}

export {
  modifyArray,
  modifyObject,
}
