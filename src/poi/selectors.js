/*
   eslint import/no-unresolved:
   [ 'error', { ignore: [
     'views/utils/selectors',
   ] }]
 */

import _ from 'lodash'
import { createSelector } from 'reselect'
import {
  constSelector,
  wctfSelector,
} from 'views/utils/selectors'

/*
   returns a function:

   canEquip(equipMstId: int)(shipMstId: int): bool or null

   - curried in such a way to allow parametrizing on equipment id.

   - returning `null` means failure - it could be the case
     when either equipMstId or shipMstId is not found
   - returning a bool to indicate if it's possible to equip <equipMstId> on ship <shipMstId>

   - the data source is from poi's fcd data of WhoCallsTheFleet,
     which is introduce in poi-8.1.0. so in order to make this work,
     a supported version (at least 8.1.0) of poi is required.

 */
const canEquipFuncSelector = createSelector(
  wctfSelector,
  w => equipMstId => {
    const eqpInfo = _.get(w, ['items', equipMstId])

    if (_.isEmpty(eqpInfo))
      return _shipMstId => null

    return shipMstId => {
      const shipInfo = _.get(w, ['ships', shipMstId])
      if (_.isEmpty(shipInfo))
        return null

      const eqpTypeInfo = _.get(w, ['item_types', eqpInfo.type])
      /* eslint-disable camelcase */
      const {
        equipable_extra_ship = [],
        equipable_on_type,
      } = eqpTypeInfo
      /* eslint-enable camelcase */
      return equipable_on_type.includes(shipInfo.type) ||
        equipable_extra_ship.includes(shipMstId)
    }
  }
)

/*
   returns canEquip function specialized on telling
   whether a ship is capable of equipping Daihatsu Landing Craft,
   so for the resulting function you need only give shipMstId.
 */
const canEquipDLCFuncSelector = createSelector(
  canEquipFuncSelector,
  canEquip => _.memoize(canEquip(68 /* 大発動艇 */))
)

const shipRemodelInfoSelector = createSelector(
  constSelector,
  ({$ships}) => {
    // master id of all non-abyssal ships
    const mstIds = _.values($ships).map(x => x.api_id).filter(x => x <= 1500)
    // set of masterIds that has some other ship pointing to it (through remodelling)
    const afterMstIdSet = new Set()

    mstIds.map(mstId => {
      const $ship = $ships[mstId]
      const afterMstId = Number($ship.api_aftershipid)
      if (afterMstId !== 0)
        afterMstIdSet.add(afterMstId)
    })

    // all those that has nothing pointing to them are originals
    const originMstIds = mstIds.filter(mstId => !afterMstIdSet.has(mstId))

    // chase remodel chain until we either reach an end or hit a loop
    const searchRemodels = (mstId, results=[]) => {
      afterMstIdSet.delete(mstId)
      if (results.includes(mstId))
        return results

      const newResults = [...results, mstId]
      const $ship = $ships[mstId]
      const afterMstId = Number(_.get($ship,'api_aftershipid',0))
      if (afterMstId !== 0) {
        return searchRemodels(afterMstId,newResults)
      } else {
        return newResults
      }
    }

    /*
       remodelChains[originMstId] = <RemodelChain>

       - originMstId: master id of the original ship
       - RemodelChain: an Array of master ids, sorted by remodeling order.
     */
    const remodelChains = _.fromPairs(originMstIds.map(originMstId => {
      return [originMstId, searchRemodels(originMstId)]
    }))

    // Some remodal chain has no originMstId
    afterMstIdSet = new Set([...afterMstIdSet].sort((a, b) => a - b))
    while (afterMstIdSet.size > 0) {
      const originMstId = afterMstIdSet.values().next().value
      afterMstIdSet.delete(originMstId)
      remodelChains[originMstId] = searchRemodels(originMstId)
    }

    // originMstIdOf[<master id>] = <original master id>
    const originMstIdOf = {}
    Object.entries(remodelChains).map(([originMstId, remodelChain]) => {
      remodelChain.map(mstId => {
        originMstIdOf[mstId] = originMstId
      })
    })
    return {remodelChains, originMstIdOf}
  }
)

export {
  canEquipFuncSelector,
  canEquipDLCFuncSelector,
  shipRemodelInfoSelector,
}
