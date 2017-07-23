/*
   This module is meant to be a module that you can use without
   any dependencies.
 */

// enumFromTo(x,y) = [x,x+1,x+2...y]
// only guarantee to work on increasing sequences
const enumFromTo = (frm,to,succ=(x => x+1)) => {
  const arr = []
  for (let i=frm; i<=to; i=succ(i))
    arr.push( i )
  return arr
}

// usage: "ignore(a,b,c)" to make eslint believe that "a", "b" and "c"
// are somehow being used,
// it serves as an explicit annotation to say that they actually aren't
const ignore = () => undefined

const not = x => !x

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

// modifyObject(propName,f)(xs)" is like "modifyArray" for Objects.
// Additionally, if you set `removeUndefined` to true,
// you'll get back an Object without that key if you have returned `undefined`
// in your modifier.
const modifyObject = (propName, f, removeUndefined = false) => {
  if (typeof f !== 'function')
    console.error('modifier is not a function')

  return obj => {
    const val = obj[propName]
    const isValAssigned = propName in obj
    const newVal = f(val,propName,isValAssigned)
    if (val === newVal)
      return obj

    if (typeof newVal === 'undefined' && removeUndefined) {
      if (isValAssigned) {
        const {[propName]: _ignored, ...rest} = obj
        return rest
      } else {
        return obj
      }
    } else {
      return ({
        ...obj,
        [propName]: newVal,
      })
    }
  }
}

// create a singleton object
const singObj = propName => v => ({[propName]: v})

const scan = (xs, acc, zero) => {
  const ys = new Array(xs.length+1)
  ys[0] = zero
  for (let i=0; i<xs.length; ++i) {
    ys[i+1] = acc(ys[i],xs[i])
  }
  return ys
}

export {
  enumFromTo,
  ignore,
  not,

  modifyArray,
  modifyObject,

  singObj,
  scan,
}
