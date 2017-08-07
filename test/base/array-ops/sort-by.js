import _ from 'lodash'
import { assert, spec } from '../../common'
import {
  generalComparator,
  sortBy, inplaceSortBy,
} from '../../../src/base/array-ops'

describe('sortBy & inplaceSortBy', () => {
  const genInt = () => _.random(1,100)
  const genArr = n => _.times(n,genInt)

  spec('sortBy tests', () => {
    const xs = genArr(1000)
    const backup = [...xs]
    const expected = [...xs].sort(generalComparator)
    const actual = sortBy()(xs)
    assert.deepEqual(actual, expected)
    assert.deepEqual(xs,backup)
  })

  spec('inplaceSortBy tests', () => {
    const xs = genArr(1000)
    const expected = [...xs].sort(generalComparator)
    const actual = inplaceSortBy()(xs)
    assert.deepEqual(actual, expected)
  })
})
