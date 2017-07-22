import _ from 'lodash'
import { shallowequal as shallowEqual } from 'shallowequal'

// enumFromTo(x,y) = [x,x+1,x+2...y]
// only guarantee to work on increasing sequences
const enumFromTo = (frm,to,succ=(x => x+1)) => {
  const arr = []
  for (let i=frm; i<=to; i=succ(i))
    arr.push( i )
  return arr
}

// usage: "ignore(a,b,c)" to fool eslint to believe that "a", "b" and "c"
// are somehow being used, it serves as an explicit annotation to say that they actually aren't
const ignore = () => undefined

const identity = x => x

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

const precompose = prj => f => (...args) =>
  f(...args.map(prj))

const mergeResults = (...funcs) => (...args) =>
  funcs.map(f => f.call(null,...args)).reduce((acc,x) => ({
    ...acc, ...x}), {})

// `deepWrite(map)([k1,k2,k3...])(value)`
// - assigns `value` to `map.get(k1).get(k2).get(k3)...`.
// - new Map objects are created if some keys are missing along the path.
// - INVARIANT: keys.length >= 1
const deepWrite = map => keys => value => {
  if (keys.length === 0) {
    console.error(`invariant violation: empty key array`)
    return undefined
  }
  if (keys.length === 1) {
    const [key] = keys
    map.set(key,value)
    return map
  } else {
    const [key, ...ks] = keys
    const subMap = map.has(key) ? map.get(key) : new Map()
    const subMapAfter = deepWrite(subMap)(ks)(value)
    map.set(key,subMapAfter)
    return map
  }
}

const deepLookup = map => keys => {
  if (keys.length === 0) {
    return map
  }

  const [key, ...restKeys] = keys
  return map.has(key) ?
    deepLookup(map.get(key))(restKeys) :
    undefined
}

const deepMapToObject = map => {
  if (map instanceof Map) {
    const obj = {}
    map.forEach((v,k) => {
      obj[k] = deepMapToObject(v)
    })
    return obj
  } else {
    return map
  }
}

const memoizeFixedArity = arity => func => {
  if (typeof arity !== 'number' || arity <= 0) {
    console.warn(`invariant violation: arity should be a positive number`)
    // in this case we just leave the function intact and return it.
    return func
  }
  let cache = new Map()

  return (...args) => {
    if (args.length !== arity) {
      console.warn(`arity mismatched, skipping cache lookup.`)
      return func(...args)
    }

    const cached = deepLookup(cache)(args)
    if (typeof cached === 'undefined') {
      const result = func(...args)
      cache = deepWrite(cache)(args)(result)
      return result
    } else {
      return cached
    }
  }
}

const pickSomeFrom = (() => {
  // nondeterministically pick one value from an array
  // and only keep those after the picked one.
  const pickOneFrom = xs => {
    if (xs.length === 0) {
      return []
    } else {
      return xs.map((x,ind) => ({
        picked: x,
        remained: xs.filter((_ignored,rInd) => ind < rInd),
      }))
    }
  }

  const pickSomeFromImpl = n => xs => {
    if (n === 0) {
      return [{pickedList: [], remained: xs}]
    }

    // all possible ways to pick one from 'xs'
    const alts = pickOneFrom(xs)
    return _.flatMap(alts, ({picked,remained}) => {
      const results = pickSomeFromImpl(n-1)(remained)
      return results.map(result => ({
        ...result,
        pickedList: [picked, ...result.pickedList],
      }))
    })
  }
  return pickSomeFromImpl
})()

const mergeMapDispatchToProps = (...mdtps) => dispatch =>
  mdtps.reduce(
    (props, curMdtp) => ({...props, ...curMdtp(dispatch)}),
    {})

const mergeMapStateToProps = mergeMapDispatchToProps

// shallowly remove properties whose value is `undefined` for an Object
const shallowCompactObject = obj =>
  _.fromPairs(
    _.toPairs(obj).filter(([_k,v]) =>
      typeof v !== 'undefined'))

const scan = (xs, acc, zero) => {
  const ys = new Array(xs.length+1)
  ys[0] = zero
  for (let i=0; i<xs.length; ++i) {
    ys[i+1] = acc(ys[i],xs[i])
  }
  return ys
}

// create singleton object
const singObj = propName => v => ({[propName]: v})

const poiUtils = {
  handleNoSubmit: e => e.preventDefault(),
  improvementToStr: level =>
    level === 0 ? '★=0' :
    level === 10 ? '★+max' :
    `★+${level}`,
  selectorTester: (selector,name = 'testSelector') => {
    window[name] = (f = x => x) => {
      try {
        const { getStore } = window
        // eslint-disable-next-line no-console
        console.log(f(selector(getStore())))
      } catch (e) {
        console.error(`error while testing selector ${e}`)
      }
    }
  },
}

export {
  enumFromTo,
  ignore,
  identity,
  not,
  scan,

  modifyArray,
  modifyObject,

  precompose,
  mergeResults,

  deepWrite,
  deepLookup,
  deepMapToObject,

  memoizeFixedArity,

  pickSomeFrom,
  shallowEqual,

  mergeMapDispatchToProps,
  mergeMapStateToProps,
  shallowCompactObject,
  singObj,

  poiUtils,
}
