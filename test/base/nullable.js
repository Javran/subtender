import { assert, spec } from '../common'

import { Nullable } from '../../src/base/nullable'

describe('Nullable.destruct', () => {
  spec('tests', () => {
    {
      const destruct = Nullable.destruct({
        one: v => v,
        none: () => 'nothing',
      })
      assert.equal(destruct(null),'nothing')
      assert.equal(destruct(undefined),undefined)
      assert.equal(destruct(1),1)
    }
    {
      const destruct = Nullable.destruct(
        {
          one: v => v,
          none: () => 'nothing',
        },
        true
      )
      assert.equal(destruct(null),'nothing')
      assert.equal(destruct(undefined),'nothing')
      assert.equal(destruct(1),1)
    }
  })
})
