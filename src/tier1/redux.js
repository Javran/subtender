/*

   make a simple reducer that accepts only a "Modify" action.

   - a "Modify" action has the shape:

     - type: `modifyActionType`
     - modifier: a function that takes the whole state and produces another

   optionally you can give `readyActionType`, which must be a non-empty string,
   which creates a different kind of reducer that, in addition to
   have the initial state as specified, will have a "ready" property of
   bool type.

   this kind of reducer initially accepts only a "Ready" action:

   - a "Ready" action has the shape:

     - type: `readyActionType`
     - newState: a state to replace the whole state

   this action will set "ready" property to "true" automatically.
   and only accepts "Modify" action (exactly as described above) when "ready" property
   is set to true.

   note that your modifier has access to the "ready" property, so your "Modify"
   action may set a reducer state to "not-ready", but only "Ready" action
   can set a reducer to back to ready state.

   it's recommended that you should give `modifyActionType` and `readyActionType`
   as string literals, since a string literal has a better chance of being interned
   than those generated at runtime.

 */
const mkSimpleReducer = (
  /*
     either:
     - it's a function, which will be called without
       argument when it needs a initial state
     - it's an Object, which will be used as initial state
   */
  initStateValOrThunk,
  modifyActionType,
  readyActionType = null
) => {
  const getInitState =
    typeof initStateValOrThunk === 'function' ?
      initStateValOrThunk :
      () => initStateValOrThunk

  const defaultReducerImpl = (state = getInitState(), action) => {
    if (action.type === modifyActionType) {
      const {modifier} = action
      return modifier(state)
    }
    return state
  }

  if (!readyActionType) {
    return defaultReducerImpl
  } else {
    if (typeof readyActionType !== 'string')
      throw new Error('expecting readyActionType to be non-empty string')

    const getInitStateWithReady = () => ({
      ...getInitState(),
      ready: false,
    })

    return (state = getInitStateWithReady(), action) => {
      if (action.type === readyActionType) {
        const {newState} = action
        return {
          ...newState,
          ready: true,
        }
      }
      if (!state.ready)
        return state
      return defaultReducerImpl(state, action)
    }
  }
}

export { mkSimpleReducer }
