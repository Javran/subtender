/*
   eslint import/no-unresolved:
   [ 'error', { ignore: [
     'views/create-store',
   ] }]
 */
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

  return dbgHandler
}

export {
  selectorTester,
  injectReloaders,
  mkDebug,
}
