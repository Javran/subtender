import _ from 'lodash'
import { assert, spec } from '../../common'
import {
  generalComparator,
  unionSorted,
} from '../../../src/base/array-ops'

describe('unionSorted', () =>
  spec('tests', () => {
    const mergeSort = xs => {
      const union = unionSorted()
      if (xs.length <= 1)
        return xs
      const mid = Math.floor(xs.length/2)
      const left = xs.slice(0,mid)
      const right = xs.slice(mid)
      return union(mergeSort(left),mergeSort(right))
    }

    const genInt = () => _.random(1,100)
    const xs = _.times(1000,genInt)
    const expected = [...xs].sort(generalComparator)
    const actual = mergeSort(xs)
    assert.deepEqual(actual, expected)
  })
)
