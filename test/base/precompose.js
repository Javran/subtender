import { assert, spec } from '../common'

import { precompose } from '../../src/base/common'

describe('precompose', () =>
  spec('precompose', () => {
    const f = (a,b,c,d) => `${a}-${b}-${c}-${d}`
    const mul2 = x => x*2
    const plus10 = x => x+10
    assert.equal(precompose(mul2)(f)(1,2,3,4), '2-4-6-8')
    assert.equal(precompose(plus10)(f)(1,2,3,4), '11-12-13-14')
  })
)
