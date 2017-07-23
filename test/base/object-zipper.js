import _ from 'lodash'
import { assert, spec } from '../common'

import { enumFromTo, modifyObject, ObjectZipper } from '../../src/base'

describe('ObjectZipper', () => {
  const genKey = () => _.sample([
    () => _.sample(_.words('a b c d e')),
    () => _.random(1,5),
  ])()

  const genModifier = () => _.sample([
    ...enumFromTo(1,5).map(x => (val=0) => val+x),
    ...enumFromTo(1,3).map(x => (val=0) => val*x),
  ])

  const repeatGen = (count,gen) =>
    enumFromTo(1,count).map(gen)

  describe('same effect as modifyObject', () => {
    const randomTest = testNum =>
      spec(`random test #${testNum}`, () => {
        const mods = _.zip(
          repeatGen(20, genKey),
          repeatGen(20, genModifier)
        )

        const v1 = mods.reduce(
          (obj,[k,m]) => modifyObject(k,m)(obj),
          {})

        const v2 = ObjectZipper.withZipped(initOzp =>
          mods.reduce(
            (ozp,[k,m]) => ObjectZipper.modify(k,m)(ozp),
            initOzp)
        )({})

        assert.deepEqual(v1,v2)
      })

    enumFromTo(1,5).map(randomTest)
  })
})
