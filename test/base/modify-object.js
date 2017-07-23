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

  spec('tests', () => {
    {
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

