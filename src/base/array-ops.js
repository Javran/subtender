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
    const v = xs[index]
    const newV = f(v)
    if (v !== newV) {
      const ys = [...xs]
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

/*

   the functions in next section deals with things related to Array.prototype.sort

   terms:

   - comparator: a function that accepts two arguments and can be used as
     the argument to Array.prototype.sort

   - projector: a function that projects an Array element into a value
     for the purpose of sorting

 */

/*

   a comparator that works on any value that supports
   `===`, `>` and `<`.

   Note that it's assumed that `!(x === y) && !(x < y) && !(x > y)`
   suggests equality.

 */
const generalComparator = (x,y) =>
  (x === y) ? 0 :
  (x < y) ? -1 :
  (x > y) ? 1 :
  0

// composing multiple comparators into one by
// trying comparators **from left to right**, and return first non-zero value.
// if no comparator is provided or all comparator has return 0
// the resulting comparator returns 0 as well.
const chainComparators = (...cmps) => (x,y) => {
  // using for loop so we have a convenient way of short-cutting
  for (let i=0; i<cmps.length; ++i) {
    const result = cmps[i](x,y)
    if (result !== 0)
      return result
  }
  return 0
}

const flipComparator = cmp => (x,y) => cmp(y,x)

// create a comparator
// assuming the given projector projects a comparable value
const projectorToComparator = prj => (x,y) =>
  // yes this is a precomposition, we could have used
  // `precompose` function, but we know the arity of comparator
  // is always 2, and don't realy need to use a general version
  generalComparator(prj(x),prj(y))

const sortBy = (cmp = generalComparator) => xs => [...xs].sort(cmp)

const inplaceSortBy = (cmp = generalComparator) => xs => xs.sort(cmp)

// union 2 sorted arrays
const unionSorted = (cmp = generalComparator) => (xs,ys) => {
  const zs = []
  let xInd = 0
  let yInd = 0
  for (
    /* NOOP */;
    xInd < xs.length && yInd < ys.length;
    /* NOOP */
  ) {
    const cmpResult = cmp(xs[xInd],ys[yInd])
    if (cmpResult <= 0) {
      zs.push(xs[xInd])
      ++xInd
    } else {
      zs.push(ys[yInd])
      ++yInd
    }
  }

  return zs.concat(
    xInd < xs.length ? xs.slice(xInd) : ys.slice(yInd)
  )
}

export {
  modifyArray,
  insertAt,

  scan,

  generalComparator,
  chainComparators,
  flipComparator,
  projectorToComparator,

  sortBy,
  inplaceSortBy,

  unionSorted,
}
