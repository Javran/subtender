// enumFromTo(x,y) = [x,x+1,x+2...y]
// override 'succ' and 'cond' for custom generating behavior
const enumFromTo = (
  frm,to,
  succ = x => x + 1,
  cond = x => x <= to
) => {
  const arr = []
  for (let i=frm; cond(i); i=succ(i))
    arr.push(i)
  return arr
}

// usage: "ignore(a,b,c)" to make eslint believe that "a", "b" and "c"
// are somehow being used,
// it serves as an explicit annotation to say that they actually aren't
const ignore = () => undefined

/**

   The identity function

   @param {*} x
   @returns {*} the input

 */
const id = x => x

/**

   Negation

   @param {*} x
   @returns {bool} negation of `x`, coerced to `bool`.

 */
const not = x => !x

/**

   `modifyObject(propName,f,[removeUndefined])(obj)` returns an Object which is the same as
   `obj`, but with its `obj[propName]` replaced by applying `f` on the original value.

   The modifier `f` receives 3 arguments: `(val, propName, isValAssigned)`:

     - `val` is the value of `obj[propName]`
     - `isValAssigned` is `false` only when `propName` is not assigned for `obj`,
       this is to tell the difference between `undefined` being assigned to `obj[propName]`
       and `obj[propName]` is not assigned.

   When `removeUndefined` is set, and the modifier ends up returning `undefined`,
   the property will not be assigned for the returning Object.

   If the resulting value of the modification is strictly equal (`===`)
   to the original one, the input Object will be returned.

   Note that `modifyObject` always prioritize returning the same Object bypassing
   `removeUndefined` flag. This means that when `obj[propName]` evaluates to `undefined`
   and the modification ends up also being `undefined`, the input Object is returned
   ignoring `removeUndefined`.

   @param {*} propName
   @param {function} f
   @param {bool} removeUndefined
   @returns {function}

   @example
   modifyObject('x',modifyObject('y',(y=1) => y+2))({x: {}})
   // => {x: {y: 3}}

 */
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

// copied from redux
// originally https://github.com/reactjs/redux/blob/master/src/compose.js
const compose = (...funcs) => {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

const precompose = prj => f => (...args) =>
  f(...args.map(prj))

/*
   split a string by ' '. mostly for providing
   a convenient way of writing constant Arrays,
   so you can write `words('a b c')` instead of `['a','b','c']`.
 */
const words = xs => xs.split(' ')

/*
   I'm not going to deal with mismatching types or NaN,
   which is an unreadable mess by itself. do the sanity check yourself.
 */
const clamp = (min=-Infinity, max=+Infinity) => v =>
  (v <= max) ?
    (v >= min ? v : min) :
    max

export {
  enumFromTo,
  ignore,

  id,
  not,

  modifyObject,

  singObj,

  compose,
  precompose,

  words,
  clamp,
}
