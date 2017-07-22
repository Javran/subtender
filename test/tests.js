import assert from 'assert'

import { modifyArray } from '../src'

const spec = it

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

    assert.deepEqual(
      modifyArray(4,() => false)(arr),
      [1,2,3,4,false])

    assert.throws( () => {
      modifyArray(undefined,undefined)
    })

    assert.throws( () => {
      modifyArray(x => !x,10)
    })
  })
})
