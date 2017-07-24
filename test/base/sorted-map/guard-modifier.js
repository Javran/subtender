import { assert, spec } from '../../common'

import { SortedMap } from '../../../src/base/sorted-map'

describe('SortedMap.guardModifier', () => {
  // for turning console.error calls into errors
  let consoleError
  before( () => {
    consoleError = console.error
    console.error = (...args) => {
      throw Error(JSON.stringify(args))
    }
  })
  after(() => {
    console.error = consoleError
  })

  spec('tests', () => {
    {
      const smContext = {
        elementToKey: x => x,
        compareKey: (x,y) => x-y,
      }

      {
        const decoratedMod = SortedMap.guardModifier(smContext)(
          (_v,_k) => undefined)

        assert.equal(
          decoratedMod(1,1,true),
          undefined)
      }

      {
        const decoratedMod = SortedMap.guardModifier(smContext)(
          (v,_k) => v+1)

        assert.throws(() =>
          decoratedMod(1,1,true))
      }
    }
    {
      const smContext = {
        elementToKey: x => Math.floor(x/10),
        compareKey: (x,y) => x-y,
      }
      {
        const decoratedMod = SortedMap.guardModifier(smContext)(
          (v,_k) => Math.floor(v/10)*10)

        /*
           despite the value being changed,
           key is preserved under the defined context,
           therefore it's fine
         */
        assert.equal(
          decoratedMod(123,12,true),
          120)
      }
    }
  })
})
