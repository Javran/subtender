# Documentation for `subtender/base`

## `modifyObject`


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
