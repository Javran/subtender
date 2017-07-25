import _ from 'lodash'
import { assert, spec } from '../../common'
import { enumFromTo } from '../../../src/base/common'
import {
  chainComparators,
  projectorToComparator,
} from '../../../src/base/array-ops'

describe('chainComparators & projectorToComparator', () =>
  spec('tests', () => {
    /*
       making the value space very compact
       so the chained comparator has to rely on comparators other
       than the first one
     */
    const genInt = () => _.random(1,4)

    const genObj = () => ({
      t1: genInt(),
      t2: genInt(),
      t3: genInt(),
    })

    const xs = enumFromTo(1,100).map(x => ({
      ...genObj(),
      id: x,
    }))

    const expected = [...xs].sort(
      (x,y) =>
        (x.t1 - y.t1) !== 0 ? x.t1 - y.t1 :
        (x.t2 - y.t2) !== 0 ? x.t2 - y.t2 :
        (x.t3 - y.t3) !== 0 ? x.t3 - y.t3 :
        x.id - y.id)
    const actual = [...xs].sort(
      chainComparators(
        ...'t1 t2 t3 id'.split(' ').map(w =>
          projectorToComparator(x => x[w])),
        // the following one always throw,
        // for testing short-cutting behavior
        () => {
          throw new Error(`unreachable`)
        }
      )
    )
    assert.deepEqual(actual, expected)
  })
)
