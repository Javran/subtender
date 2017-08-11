import { assert, spec } from '../../common'

import { modifyObject } from '../../../src/base'
import { mkSimpleReducer } from '../../../src/tier1/redux'

describe('mkSimpleReducer', () => {
  const modifyAction = 'test@Modify'
  describe("no 'Ready' action", () => {
    describe('reducer with init val', () => {
      const initState = {testProp1: 10, testProp2: 20}

      const reducer1 = mkSimpleReducer(initState, modifyAction)
      const reducer2 = mkSimpleReducer(initState, modifyAction)

      const rInitState1 = reducer1(undefined, {type: '@@INIT'})
      const rInitState2 = reducer2(undefined, {type: '@@INIT'})

      spec('should refer to the same object', () => {
        assert(rInitState1 === initState)
        assert(rInitState2 === initState)
      })

      spec("'Modify' action works", () =>
        assert.deepEqual(
          reducer1(
            rInitState1,
            {
              type: modifyAction,
              modifier: modifyObject('testProp2',x => x*7),
            }
          ),
          {
            testProp1: 10,
            testProp2: 20*7,
          }
        )
      )
    })
    describe('reducer with init thunk', () => {
      const getInitState = () => ({dummy: 1})
      const reducer1 = mkSimpleReducer(getInitState, modifyAction)
      const reducer2 = mkSimpleReducer(getInitState, modifyAction)

      const rInitState1 = reducer1(undefined, {type: '@@INIT'})
      const rInitState2 = reducer2(undefined, {type: '@@INIT'})

      spec('verify runtime creation', () => {
        assert(rInitState1 !== rInitState2)
        assert.deepEqual(rInitState1,rInitState2)
      })
    })
  })
})
