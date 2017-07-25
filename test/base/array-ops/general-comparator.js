import _ from 'lodash'
import { assert, spec } from '../../common'
import { enumFromTo } from '../../../src/base/common'
import {
  generalComparator,
  flipComparator,
} from '../../../src/base/array-ops'

describe('generalComparator & flipComparator', () =>
  spec('tests', () => {
    const xs = enumFromTo(1,100).map(() => _.random(-1000,1000))
    const expected = [...xs].sort((x,y) => x-y)
    const actual = [...xs].sort(generalComparator)
    assert.deepEqual(actual,expected)

    const actual2 = [...xs].sort(flipComparator(generalComparator)).reverse()
    assert.deepEqual(actual2,expected)
  }))
