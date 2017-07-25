import _ from 'lodash'
import { assert, spec } from '../../common'

import { enumFromTo } from '../../../src/base/common'
import { insertAt } from '../../../src/base/array-ops'

describe('insertAt', () =>
  spec('tests', () => {
    {
      const xs = 'b c d'.split(' ')
      const ys = [...xs]
      assert.deepEqual(
        insertAt(0,'a')(xs),
        'a b c d'.split(' '))
      // no mutation
      assert.deepEqual(xs,ys)

      assert.deepEqual(
        insertAt(1,'a')(['b','c','d']),
        'b a c d'.split(' '))
      // no mutation
      assert.deepEqual(xs,ys)
    }
    {
      const randoms = enumFromTo(1,100)
        .map(() => _.random(1,10000))
      const actual = randoms.reduce(
        (xs, x) => insertAt(0,x)(xs),
        [])
      const expected = [...randoms].reverse()

      assert.deepEqual(actual, expected)
    }
  })
)
