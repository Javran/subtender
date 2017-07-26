import { assert, spec } from '../common'

import { clamp } from '../../src/base'

describe('clamp', () => {
  spec('tests', () => {
    assert.equal(clamp(1,10)(4), 4)
    assert.equal(clamp(1,10)(-10), 1)
    assert.equal(clamp(1,10)(255), 10)
  })
})
