class Nullable {
  /*

     Nullable.destruct({one,none}[,undefIsNull])(x) inspects the value x, which could be `null`,
     and dispatch to either `one` or `none` according:

     - if the value is not `null`, `one` is called with `x`
     - if the value is `null`, `none` is called without argument

     You can optionally passed a boolean to `undefIsNull` (default: false),
     when it's `true`, value `undefined` is also considered a null value so `none` is called.

   */
  /* eslint-disable indent */
  static destruct = ({one,none}, undefIsNull = false) => x =>
    x === null ? none() :
    (undefIsNull && typeof x === 'undefined') ? none() :
    one(x)
  /* eslint-enable indent */
}

export { Nullable }
