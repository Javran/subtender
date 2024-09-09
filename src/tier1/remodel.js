import _ from 'lodash'

import {
  chainComparators,
  inplaceSortBy,
} from '../base'

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

const shipRemodelInfoBuilder = $ships => {
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

export {
  shipRemodelInfoBuilder,
}
