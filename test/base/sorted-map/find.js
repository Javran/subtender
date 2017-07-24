import { assert, spec } from '../../common'

import { enumFromTo } from '../../../src/base/common'
import { SortedMap } from '../../../src/base/sorted-map'

describe('SortedMap.find', () => {
  spec('tests', () => {
    const xs = [1,3,4].map(key => ({key}))
    enumFromTo(0,5).map(key =>
      assert.equal(
        SortedMap.find()(key)(xs),
        xs.find(x => x.key === key)))
  })
})
