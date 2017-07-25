import { assert, spec } from '../../common'

import { scan } from '../../../src/base'

describe('scan', () => {
  spec('tests', () => {
    assert.deepEqual(
      scan([4,3,2,1], (x,y) => `${x}-${y}`, '5'),
      [
        '5',
        '5-4',
        '5-4-3',
        '5-4-3-2',
        '5-4-3-2-1',
      ])
    {
      const a = {}
      const b = scan([], (x,y) => x+y, a)
      assert.deepEqual(b, [{}])
      assert(a === b[0])
    }
  })
})
