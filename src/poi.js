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

  /*
     dbgHandler.log and dbgHandler.assert cannot be bound too early,
     otherwise the enable() / disable() won't be respected.

     we workaround by using class getters, which can be used without
     explicit giving an argument list.

     this way runtime dbgHandler 'enabled' flag will be respected,
        and also we'll get correct source locations
   */
  const debug = new (class {
    constructor(dbgHandlerArg) {
      this.dbgHandler = dbgHandlerArg
    }

    get log() {
      return this.dbgHandler.log
    }

    get assert() {
      return this.dbgHandler.assert
    }

    enable() {
      return this.dbgHandler.enable()
    }

    disable() {
      return this.dbgHandler.disable()
    }
    // things that could go wrong should be easily spotted
    // unconditionally
    warn =
      console.warn.bind(
        console,
        `%c${tagName}`,
        'background: linear-gradient(30deg, cyan, white 3ex)')

    error =
      console.error.bind(
        console,
        `%c${tagName}`,
        'background: linear-gradient(30deg, cyan, white 3ex)')
  })(dbgHandler)

  return debug
}

export {
  selectorTester,
  injectReloaders,
  mkDebug,
}
