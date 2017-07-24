/*

   despite the fact that mergeMapDispatchToProps and mergeMapStateToProps
   does not depend on anything, they require 'react-redux' to make sense.

 */


/*
   takes a list of mapDispatchToProp and construct a new one
   that maps state to an Object whose properties are merged
   from resulting Objects of these mapDispatchToProp functions.
 */
const mergeMapDispatchToProps = (...mstps) => {
  const violatedInd = mstps.findIndex(mstp => typeof mstp !== 'function')
  if (violatedInd !== -1) {
    console.error(`mergeMapStateToProps requires all of its arguments to be functions`)
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
   takes a list of mapStateToProp and construct a new one
   that maps dispatch to an Object whose properties are merged
   from resulting Objects of these mapStateToProp functions.
 */
const mergeMapStateToProps =
  /*
     despite being different, their impl are identical
     therefore the sharing
   */
  mergeMapDispatchToProps

export * from './base'
export {
  mergeMapDispatchToProps,
  mergeMapStateToProps,
}
