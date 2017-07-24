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
  window.clearTaigeiCache = () => {
    Object.keys(require.cache)
      .filter(x => x.indexOf('subtender') !== -1)
      .map(x => delete require.cache[x])
  }

  window.clearI18nCache = () => {
    Object.keys(require.cache)
      .filter(x => x.indexOf('i18n') !== -1)
      .map(x => delete require.cache[x])
  }
}

export {
  selectorTester,
  injectReloaders,
}
