# common.js API documentation

<!-- div class="toc-container" -->

<!-- div -->

## `id`
* <a href="#id">`id`</a>

<!-- /div -->

<!-- div -->

## `modifyObject`
* <a href="#modifyObject">`modifyObject`</a>

<!-- /div -->

<!-- div -->

## `not`
* <a href="#not">`not`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `id`

<!-- div -->

<h3 id="id"><a href="#id">#</a>&nbsp;<code>id(x)</code></h3>
[&#x24C8;](https://github.com/Javran/subtender/tree/master/src/base/common.js#L27 "View in source") [&#x24C9;][1]

The identity function

#### Arguments
1. `x` *(&#42;)*:

#### Returns
*(&#42;)*: the input

---

<!-- /div -->

<!-- /div -->

<!-- div -->

## `modifyObject`

<!-- div -->

<h3 id="modifyObject"><a href="#modifyObject">#</a>&nbsp;<code>modifyObject(propName, f, removeUndefined)</code></h3>
[&#x24C8;](https://github.com/Javran/subtender/tree/master/src/base/common.js#L72 "View in source") [&#x24C9;][1]

`modifyObject(propName,f,[removeUndefined])(obj)` returns an Object which is the same as
`obj`, but with its `obj[propName]` replaced by applying `f` on the original value.
<br>
<br>
The modifier `f` receives `3` arguments: `(val, propName, isValAssigned)`:
<br>
<br>
<br>
* `val` is the value of `obj[propName]`
<br>
* `isValAssigned` is `false` only when `propName` is not assigned for `obj`,
this is to tell the difference between `undefined` being assigned to `obj[propName]`
and `obj[propName]` is not assigned.
<br>
<br>
When `removeUndefined` is set, and the modifier ends up returning `undefined`,
the property will not be assigned for the returning Object.
<br>
<br>
If the resulting value of the modification is strictly equal *(`===`)*
to the original one, the input Object will be returned.
<br>
<br>
Note that `modifyObject` always prioritize returning the same Object bypassing
`removeUndefined` flag. This means that when `obj[propName]` evaluates to `undefined`
and the modification ends up also being `undefined`, the input Object is returned
ignoring `removeUndefined`.

#### Arguments
1. `propName` *(&#42;)*:
2. `f` *(function)*:
3. `removeUndefined` *(bool)*:

#### Returns
*(function)*:

#### Example
```js
modifyObject('x',modifyObject('y',(y=1) => y+2))({x: {}})
// => {x: {y: 3}}
```
---

<!-- /div -->

<!-- /div -->

<!-- div -->

## `not`

<!-- div -->

<h3 id="not"><a href="#not">#</a>&nbsp;<code>not(x)</code></h3>
[&#x24C8;](https://github.com/Javran/subtender/tree/master/src/base/common.js#L37 "View in source") [&#x24C9;][1]

Negation

#### Arguments
1. `x` *(&#42;)*:

#### Returns
*(bool)*: negation of `x`, coerced to `bool`.

---

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #id "Jump back to the TOC."
