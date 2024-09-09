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
  chainComparators,
  inplaceSortBy,
} from '../base'


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

// remodelComparator(a,b) compares a and b and tries to put early forms in front.
// here both a and b are values of $ships.
const remodelComparator = chainComparators(
  // 1: compare sort_id
  (a, b) => (a.api_sort_id % 10) - (b.api_sort_id % 10),
  // 2: compare sortno
  (a, b) => a.api_sortno - b.api_sortno,
  // 3: compare ship id
  (a, b) => a.api_id - b.api_id,
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
  ({$ships}) => {
    const mstObjs = _.values($ships).filter(x => x.api_id <= 1500)
    // master ids of all non-abyssal ships
    const mstIds = mstObjs.map(x => x.api_id)
    const groupped = _.groupBy(mstObjs, x => x.api_yomi)

    // set of masterIds that has some other ship pointing to it (through remodelling)
    const afterMstIdSet = new Set()

    // key: mstId, value: Set of mstId
    const remodelGraph = new Map()

    // traverse all remodels
    mstIds.map(mstId => {
      const $ship = $ships[mstId]
      const afterMstId = Number($ship.api_aftershipid)
      if (afterMstId !== 0) {
        afterMstIdSet.add(afterMstId)
        if (remodelGraph.has(mstId)) {
          remodelGraph.get(mstId).add(afterMstId)
        } else {
          const s = new Set()
          s.add(afterMstId)
          remodelGraph.set(mstId, s)
        }
      }
    })

    const mstIdRemodelComparator = (mstIdA, mstIdB) =>
      remodelComparator($ships[mstIdA], $ships[mstIdB])
    const inplaceSortMstIdsByRemodel = inplaceSortBy(mstIdRemodelComparator)

    /*
      An Array whose elements are Arrays of mstIds.
      mstIds that are in the same Array are considered belonging to the same remodel cluster.
      Note that this step is just to group mstIds, we'll further process each group individually.
     */
    const remodelClusters = []
    _.toPairs(groupped).forEach(([_yomi, vals]) => {
      remodelClusters.push(vals.map(x => x.api_id))
    })

    const remodelChains = {}
    const originMstIdOf = {}
    _.forEach(remodelClusters, mstIdCluster => {
      /*
        In most cases this correctly finds the original ship.

        Note that we are assuming there is at most one ship in each cluster
        that has no in-degree, which should be a safe one.
       */
      let originMstId = mstIdCluster.find(mstId => !afterMstIdSet.has(mstId))
      if (!originMstId) {
        // mstIdCluster must be non-empty to have this element in the first place.
        [originMstId] = mstIdCluster
        // sorting is unnecessary as we just want to find the minimum
        for (let i = 1; i < mstIdCluster.length; ++i) {
          const curMstId = mstIdCluster[i]
          if (mstIdRemodelComparator(originMstId, curMstId) > 0) {
            originMstId = curMstId
          }
        }
      }

      mstIdCluster.forEach(mstId => {
        originMstIdOf[mstId] = originMstId
      })

      const visited = new Set()
      const depClusters = []
      const searchRemodels = (mstId, depth) => {
        if (visited.has(mstId)) {
          return
        }
        visited.add(mstId)
        if (typeof depClusters[depth] === 'undefined') {
          depClusters[depth] = [mstId]
        } else {
          depClusters[depth].push(mstId)
        }

        if (remodelGraph.has(mstId)) {
          remodelGraph.get(mstId).forEach(afterMstId =>
            searchRemodels(afterMstId, depth+1)
          )
        }
      }
      searchRemodels(originMstId, 0)
      // if there is ever more than one element in one depth
      // this sorting step should make a reasonable decision.
      depClusters.forEach(xs => inplaceSortMstIdsByRemodel(xs))
      const remodelChain = _.compact(_.flatten(depClusters))
      remodelChains[originMstId] = remodelChain

      // last round of sanity check, if anything in the cluster is unreachable,
      // this part should signal it.
      const unreachableMstIds = mstIdCluster.filter(mstId => !visited.has(mstId))
      if (unreachableMstIds.length > 0) {
        console.warn(`Unreachable from originMstId=${originMstId}: ${unreachableMstIds}, those will be ignored from remodelChains data.`)
      }
    })
    return {remodelChains, originMstIdOf}
  }
)

export {
  canEquipFuncSelector,
  canEquipDLCFuncSelector,
  shipRemodelInfoSelector,
}
