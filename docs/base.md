# Documentation for `subtender/base`

A collection of basic utility functions.

Unless explicitly specified, functions in this module does not mutate any existing value
passing to them. So if you see terms like "modify", it means creating some new value
with some portion of it changed.

Also functions in this module is considered frequently called, for performance concerns,
there are very few guarding mechanism to prevent you from misuse.

- [`enumFromTo`](#enumfromto)
- [`modifyObject`](#modifyobject)

- [`modifyArray`](#modifyarray)
- [`insertAt`](#insertat)
- [`scan`](#scan)
- [`generalComparator`](#generalcomparator)
- [`chainComparators`](#chaincomparators)
- [`flipComparator`](#flipcomparator)
- [`projectorToComparator`](#projectortocomparator)

## Terms

- comparator: a function that accepts two arguments and can be used as
  the second argument to `Array.prototype.sort`

- projector: a function that projects an Array element into a value
  for the purpose of sorting

## `enumFromTo`

`enumFromTo(frm,to,[succ = x => x+1],[cond = x => x <= to])` generates an Array.

If `succ` and `cond` are omitted, the result will be `[frm,frm+1,frm+2,...,to]`.

Otherwise:

- `succ` is a function that takes last generated value and produces the next one
- `cond` is a function that takes last generated value and determine
  whether we should stop: any falsy value stops the generation.

All generated values will be present in the resulting Array in the order
of their generation.

## `modifyObject`

`modifyObject(propName,f,[removeUndefined = false])(obj)` returns an Object which is the same as
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

Make use of default parameters and chain `modifyObject` allows modifying
deeper Objects:

```js
modifyObject(
  'x',
  modifyObject(
    'y',(y=1) => y+2
  )
)({x: {}})
// => {x: {y: 3}}
```

Use function composition to achieve more complicated modifications:

```js
modifyObject(
  'x',
  _.flow(
    modifyObject(
      'y', (y=1) => y+2,
    ),
    modifyObject(
      'z', z => z*5
    ),
  )
)({x: {z: 2}})
// => {x: {z: 10, y: 3}}
```

## `modifyArray`

`modifyArray(index,f)(xs)` modifies Array `xs` at `index`.
The original value at `xs[index]` is fed to `f` to produce the value
after modification.

- Out of bound modification results in returning the original Array
- if value after modification is strictly equal (`===`) to the old one,
  the original Array is returned.

## `insertAt`

`insertAt(ind,val)(xs)` inserts `val` at `ind` of `xs`.
Original values after the insertion point are shifted.

## `scan`

Uncurried version of [scanl](https://hackage.haskell.org/package/base-4.10.0.0/docs/Data-List.html#v:scanl).

## `generalComparator`

`generalComparator` is supposed to be used as the second argument of `Array.prototype.sort`,
which works on any values as long as using `===`, `>` and `<` produces
the expected result.

## `chainComparators`

`chainComparators(cmp1, cmp2, ...)` takes comparators `cmp1`, `cmp2`, ...
to produce a new comparator, which is the same as `cmp1` but when
`cmp1` produces a tie, `cmp2` is attempted and so on.
The resulting comparator will short-circuit if an early comparator in chain
has already provided a non-zero result.

## `flipComparator`

`flipComparator` takes a comparator to produce the other comparator
with its two arguments flipped.

## `projectorToComparator`

`projectorToComparator(prj)` takes a projector and produces a comparator
that uses the projected value and `generalComparator` to do the comparison.
