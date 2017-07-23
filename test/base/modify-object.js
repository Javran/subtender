import { assert, spec } from '../common'

import { modifyObject } from '../../src/base'

describe('modifyObject', () => {
  // for turning console.error calls into errors
  let consoleError
  before( () => {
    consoleError = console.error
    console.error = (...args) => {
      throw Error(JSON.stringify(args))
    }
  })
  after(() => {
    console.error = consoleError
  })

  spec('early throw on invalid modifiers', () => {
    assert.throws(() => {
      modifyObject('foo',undefined)
    })
  })

  spec('removeUndefined', () => {
    const val = {
      a: 1,
      b: {c: 2, d: {e: 3, f: 4}},
      4: {},
    }

    // removeUndefined = false
    assert.deepEqual(
      modifyObject(
        'b', () => undefined,
      )(val),
      {a: 1, b: undefined, 4: {}})

    // removeUndefined = true
    assert.deepEqual(
      modifyObject(
        'b', () => undefined,
        true,
      )(val),
      {a: 1, 4: {}})
  })

  spec('passing propName as 2nd arg', () => {
    assert.deepEqual(
      modifyObject('a', (v,k) => `${k}-${v}`)({a: 'b'}),
      {a: 'a-b'})
  })

  spec('3rd arg for whether it iss assigned', () => {
    const modifier = (_v, _k, isAssigned) =>
      isAssigned ? _v : 'not assigned'
    assert.deepEqual(
      modifyObject('a', modifier)({a: undefined}),
      {a: undefined})
    assert.deepEqual(
      modifyObject('a', modifier)({}),
      {a: 'not assigned'})
  })

  spec('tests', () => {
    {
      const val = {
        a: 1,
        b: {c: 2, d: {e: 3, f: 4}},
        4: {},
      }
      assert.deepEqual(
        modifyObject(
          'b',
          modifyObject(
            'd', ({e,f,g=10}) => e+f+g)
        )(val),
        {
          a: 1,
          b: {c: 2, d: 3+4+10},
          4: {},
        }
      )
    }
    {
      const val = {
        a: {b: {c: "foobar"}},
        d: 's',
      }
      assert(
        modifyObject(
          'a',
          modifyObject(
            'b',
            modifyObject(
              'c',
              () => 'fOoBaR'.toUpperCase().toLowerCase()
            )
          )
        )(val) === val)
    }
  })
})

