import { assert, spec } from '../common'

import { modifyArray } from '../../src/base'

describe('modifyArray', () => {
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

  spec('tests', () => {
    const arr = [1,2,3,4,5]

    assert.deepEqual(
      modifyArray(0,x => x+1)(arr),
      [2,2,3,4,5])

    // keeping it intact
    assert(modifyArray(0,x => x+1-1)(arr) === arr)

    assert.deepEqual(
      modifyArray(4,() => false)(arr),
      [1,2,3,4,false])

    assert.throws(() => {
      modifyArray(undefined,undefined)
    })

    assert.throws(() => {
      modifyArray(x => !x,10)
    })
  })
})
