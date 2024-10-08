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

import {
  shipRemodelInfoBuilder,
} from '../tier1'


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


/*
  Computes two objects: {originMstIdOf, remodelChains}

  remodelChains[originMstId] = <RemodelChain>

  - originMstId: master id (as Number) of the original ship
  - RemodelChain: an Array of master ids (as Numbers), sorted by remodeling order.

  Since 0.15.0 the algorithm is designed to handle branched remodels,
  if that ever happens, RemodelChain will sort master ids by
  number of remodel times to get to that particular master id.

  originMstIdOf[mstId] = <original master id>

  Prior to 0.15.0 values of originMstIdOf may be strings.
  But since 0.15.0 this value is always Number.

 */
const shipRemodelInfoSelector = createSelector(
  constSelector,
  ({$ships}) => shipRemodelInfoBuilder($ships)
)

export {
  canEquipFuncSelector,
  canEquipDLCFuncSelector,
  shipRemodelInfoSelector,
}
