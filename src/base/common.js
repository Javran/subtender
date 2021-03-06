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

const id = x => x

const not = x => !x

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
