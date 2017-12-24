import { assert, spec } from './common'

import { splitMapId, mapIdToStr, mapStrToId } from '../src/kc'

describe('splitMapId', () => {
  spec('basic', () => {
    assert.deepEqual(splitMapId(12), {area: 1, num: 2})
    assert.deepEqual(splitMapId(401), {area: 40, num: 1})
  })
})

describe('mapIdToStr & mapStrToId', () => {
  spec('basic', () => {
    assert.deepEqual(mapIdToStr(12), "1-2")
    assert.deepEqual(mapIdToStr(401), "40-1")

    assert.deepEqual(mapStrToId("invalid"), null)
    assert.deepEqual(mapStrToId("1-2"), 12)
    assert.deepEqual(mapStrToId("40-1"),401)
  })
})
