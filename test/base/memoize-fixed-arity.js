import _ from 'lodash'

import { assert, spec } from '../common'
import { memoizeFixedArity } from '../../src/base'

describe('memoizeFixedArity', () => {
  spec('tests', () => {
    let execCount = 0
    const f = (a,b,c,d) => {
      ++execCount
      return [a,b,c,d]
    }

    const genRandomValue = () => {
      const randomStrings = Object.getOwnPropertyNames(Object)
      const randomObjects = _.fill(new Array(100)).map(() => ({}))
      const gen = _.sample([
        () => _.random(1,1000),
        () => null,
        () => undefined,
        // just for getting a list of random strings
        () => _.sample(randomStrings),
        () => _.sample(randomObjects),
      ])
      return gen()
    }

    // generate some argument lists
    const argLists = _.fill(new Array(100))
      .map(() => _.fill(new Array(4)).map(genRandomValue))

    const memoized = memoizeFixedArity(4)(f)
    argLists.map(args => memoized(...args))
    const nowExecCount = execCount
    const shuffledArgLists = _.shuffle(argLists)
    shuffledArgLists.map(args => {
      const result = memoized(...args)
      assert.deepEqual(result,args)
    })
    // all values are cached
    assert.equal(nowExecCount, execCount)
  })
})
