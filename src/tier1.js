/*

   despite the fact that mergeMapDispatchToProps and mergeMapStateToProps
   does not depend on anything, they require 'react-redux' to make sense.

 */


/*
   despite being different, mergeMapDispatchToProps is identical to
   that of mergeMapStateToProps. thus the sharing
 */
const gMergeMapStateOrDispatchToProps = which => (...mstps) => {
  const violatedInd = mstps.findIndex(mstp => typeof mstp !== 'function')
  if (violatedInd !== -1) {
    console.error(`${which} requires all of its arguments to be functions`)
    console.error(`violation happens at arg ind ${violatedInd}`)
    return _state => {}
  }

  const shouldRequestOwnProps = mstps.some(f => f.length !== 1)
  if (shouldRequestOwnProps) {
    return (state, ownProps) =>
      mstps.reduce(
        (props, curMstp) => ({...props, ...curMstp(state, ownProps)}),
        {})
  } else {
    return state =>
      mstps.reduce(
        (props, curMstp) => ({...props, ...curMstp(state)}),
        {})
  }
}


/*
   takes a list of mapDispatchToProps and construct a new one
   that maps state to an Object whose properties are merged
   from resulting Objects of these mapDispatchToProps functions.
 */
const mergeMapDispatchToProps =
  gMergeMapStateOrDispatchToProps('mergeMapDispatchToProps')

/*
   takes a list of mapStateToProps and construct a new one
   that maps dispatch to an Object whose properties are merged
   from resulting Objects of these mapStateToProps functions.
 */
const mergeMapStateToProps =
  gMergeMapStateOrDispatchToProps('mergeMapStateToProps')

export * from './base'
export {
  mergeMapStateToProps,
  mergeMapDispatchToProps,
}
