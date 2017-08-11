import { assert, spec } from '../../common'

import { modifyObject, enumFromTo } from '../../../src/base'
import { mkSimpleReducer } from '../../../src/tier1/redux'

describe('mkSimpleReducer', () => {
  const modifyActionTy = 'test@Modify'
  const readyActionTy = 'test@Ready'
  describe("no 'Ready' action", () => {
    describe('reducer with init val', () => {
      const initState = {testProp1: 10, testProp2: 20}

      const reducer1 = mkSimpleReducer(initState, modifyActionTy)
      const reducer2 = mkSimpleReducer(initState, modifyActionTy)

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
              type: modifyActionTy,
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
      const reducer1 = mkSimpleReducer(getInitState, modifyActionTy)
      const reducer2 = mkSimpleReducer(getInitState, modifyActionTy)

      const rInitState1 = reducer1(undefined, {type: '@@INIT'})
      const rInitState2 = reducer2(undefined, {type: '@@INIT'})

      spec('verify runtime creation', () => {
        assert(rInitState1 !== rInitState2)
        assert.deepEqual(rInitState1,rInitState2)
      })
    })
  })

  describe('with "Ready" action', () => {
    const initState = {count: 0}
    const reducer = mkSimpleReducer(initState, modifyActionTy, readyActionTy)
    const rInitState = reducer(undefined, {type: '@@INIT'})
    spec("attach 'ready' prop properly", () => {
      assert.deepEqual(
        rInitState,
        {count: 0, ready: false}
      )
      {
        // enforcing "ready" prop to be false
        const initState2 = {count: 0, ready: true}
        const reducer2 = mkSimpleReducer(initState2, modifyActionTy, readyActionTy)
        const rInitState2 = reducer2(undefined, {type: '@@INIT'})
        assert.deepEqual(
          rInitState2,
          {count: 0, ready: false}
        )
      }
    })

    const addOne = {
      type: modifyActionTy,
      modifier: modifyObject('count', c => c+1),
    }
    spec('no operation when it is not ready', () => {
      const finalState = enumFromTo(1,10).reduce(
        (curState, _ignored) => reducer(curState, addOne),
        rInitState
      )
      assert(rInitState === finalState)
    })
    spec('on ready reducer', () => {
      // ready with count set to 1000
      const readyState = reducer(
        rInitState,
        {
          type: readyActionTy,
          newState: {count: 1000},
        }
      )
      const finalState = enumFromTo(1,10).reduce(
        (curState, _ignored) => reducer(curState, addOne),
        readyState
      )
      assert.deepEqual(
        finalState,
        {ready: true, count: 1010}
      )
    })

    spec('undefined newState prop', () => {
      {
        const finalState = reducer(rInitState, {type: readyActionTy})
        assert.deepEqual(
          finalState,
          {ready: true, count: 0}
        )
      }
      {
        const finalState = reducer(rInitState, {type: readyActionTy, newState: undefined})
        assert.deepEqual(
          finalState,
          {ready: true, count: 0}
        )
      }
    })
  })
})
