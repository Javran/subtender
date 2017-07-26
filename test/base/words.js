import { assert, spec } from '../common'

import { words } from '../../src/base'

describe('words', () => {
  spec('tests', () => {
    assert.deepEqual(
      words(''), [''])
    assert.deepEqual(
      words('a b c d'),
      ['a', 'b', 'c', 'd']
    )
    assert.deepEqual(
      words('ax1 1xb 111c 11d111'),
      ['ax1', '1xb', '111c', '11d111']
    )
  })
})
