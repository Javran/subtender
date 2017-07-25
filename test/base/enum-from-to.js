import { assert, spec } from '../common'

import { enumFromTo } from '../../src/base'

describe('enumFromTo', () => {
  spec('tests', () => {
    assert.deepEqual(enumFromTo(1,4),[1,2,3,4])
    assert.deepEqual(enumFromTo(10,4),[])
    assert.deepEqual(enumFromTo(3,3),[3])
    assert.deepEqual(enumFromTo(10,100,x => x+30),[10,40,70,100])

    assert.deepEqual(
      enumFromTo(4,undefined,x => x-1, x => x > 0),
      [4,3,2,1])
  })
})
