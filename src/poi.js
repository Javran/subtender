/*
   eslint import/no-unresolved:
   [ 'error', { ignore: [
     'views/create-store',
   ] }]
 */
import React from 'react'
import { store } from 'views/create-store'

// injects a function onto window that can laterly be used to test selectors
const selectorTester =
  (
    selector,
    name = 'testSelector',
    getState = store.getState
  ) => {
    // eslint-disable-next-line no-console
    window[name] = (f = console.log) => {
      try {
        return f(selector(getState()))
      } catch (e) {
        console.error(`error while testing selector ${e}`)
      }
    }
  }

const injectReloaders = () => {
  const clearCacheWithKeyword = keyword => {
    const keys =
    Object.keys(require.cache)
      .filter(x => x.indexOf(keyword) !== -1)

    keys.map(x => delete require.cache[x])
    // eslint-disable-next-line no-console
    console.log('cleared keys: ', keys)
  }

  window.clearCacheWithKeyword = clearCacheWithKeyword
  window.clearTaigeiCache = () =>
    clearCacheWithKeyword('subtender')

  window.clearI18nCache = () =>
    clearCacheWithKeyword('i18n')
}

const mkDebug = (tagName='subtender',startEnabled=false) => {
  const { dbg } = window
  const dbgHandler = dbg.extra(tagName)

  if (startEnabled) {
    dbgHandler.enable()
  } else {
    dbgHandler.disable()
  }

  dbgHandler.warn =
    console.warn.bind(
      console,
      `%c${tagName}`,
      'background: linear-gradient(30deg, cyan, white 3ex)')

  dbgHandler.error =
    console.error.bind(
      console,
      `%c${tagName}`,
      'background: linear-gradient(30deg, cyan, white 3ex)')

  return dbgHandler
}

// eslint-disable-next-line react/prop-types
const Placeholder = ({style}) => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  }}>
    <img
      style={{
        maxWidth: 600,
        width: '100%',
        height: '100%',
      }}
      src="https://pbs.twimg.com/media/DFVDZkDW0AI49Sq.jpg"
      alt="decolorized-taigei"
    />
  </div>
)

export * from './kc'

export {
  selectorTester,
  injectReloaders,
  mkDebug,
  Placeholder,
}
