import _ from 'lodash'
import { assert, spec } from '../../common'

import { enumFromTo, modifyObject } from '../../../src/base'
import { SortedMap } from '../../../src/base/sorted-map'

describe('SortedMap.modify', () => {
  const genInt = (min,max) => () => _.random(min,max)
  const repeatGen = (count,gen) =>
    enumFromTo(1,count).map(gen)

  describe(`number insertion`, () => {
    const smContext = {
      elementToKey: x => x,
      compareKey: (x,y) => x-y,
    }
    const randomTest = (desc,[valMin,valMax],size,repeatTimes) =>
      spec([
        `random test "${desc}"`,
        `(range: ${valMin}~${valMax},`,
        `size: ${size},`,
        `repeat: ${repeatTimes})`,
      ].join(' '), () =>
        enumFromTo(1,repeatTimes).map(() => {
          const input = repeatGen(size, genInt(valMin,valMax))
          const actual = input.reduce(
            (curXs, k) => SortedMap.modify(smContext)(k, () => k)(curXs),
            []
          )
          const expected = _.uniq([...input].sort((x,y) => x-y))
          assert.deepEqual(actual, expected)
        }))

    randomTest('dense',[1,10],1000,10)
    randomTest('sparse',[-100,100],500,10)
  })

  // a set of modifiers that:
  // - works on shape {key, val}
  // - attach a specific character to val if isValAssigned is true
  // - otherwise creates {key, val: ???} where ??? depends only on key
  const modifiers =
    // printable chars
    enumFromTo(32,126).map(code => {
      const ch = String.fromCharCode(code)
      const modifier = (v,key,isValAssigned) =>
        isValAssigned ?
          modifyObject('val',val => `${val}${ch}`)(v) :
          {key, val: `${key}::::`}
      return modifier
    })
  // picks a random modifier
  const genModifier = () => _.sample(modifiers)

  describe('random tests (behavior)', () =>
    enumFromTo(1,5).map(tInd =>
      spec(`test #${tInd}`, () => {
        const operations = _.zip(
          repeatGen(500, () => _.random(1,40)),
          repeatGen(500, genModifier))

        const smContext = {
          elementToKey: x => x.key,
          compareKey: (x,y) => x-y,
        }

        const actual = _.fromPairs(operations.reduce(
          (curSM, [key,mod]) =>
            SortedMap.modify(smContext)(key,mod)(curSM)
          ,
          []).map(({key,val}) => [key,val]))

        const expected = _.mapValues(
          operations.reduce(
            (curObj, [key,mod]) => ({
              ...curObj,
              [key]: mod(curObj[key],key,key in curObj),
            }),
            {}),
          x => x.val)

        assert.deepEqual(actual, expected)
      })))
})
