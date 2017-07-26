const SType = {
  DE: 1, DD: 2, CL: 3, CLT: 4,
  CA: 5, CAV: 6, CVL: 7, FBB: 8,
  BB: 9, BBV: 10, CV: 11, XBB: 12,
  SS: 13, SSV: 14, AP: 15, AV: 16,
  LHA: 17, CVB: 18, AR: 19, AS: 20,
  CT: 21, AO: 22,
}

const isOneOf = xs => x => xs.indexOf(x) !== -1

/*
   check whether a ship is capable of equipping Daihatsu Landing Craft (DLC for short)

   extracted and refactored from:
     https://github.com/KC3Kai/KC3Kai/blob/master/src/library/objects/Ship.js
 */
const canEquipDLC = (stype, masterId) => {
  const {DD, CL, BB, AV, LHA, AO} = SType
  // some DD / CL / BB are capable of equipping DLC,
  // we deal with this by whitelisting.
  if (isOneOf([DD,CL,BB])(stype)) {
    return isOneOf(
      [
        // Light cruisers
        200, // Abukuma K2
        487, // Kinu K2
        488, // Yura K2

        // Destroyers
        418, // Satsuki K2
        434, // Mutsuki K2
        435, // Kisaragi K2
        464, // Kasumi K2
        470, // Kasumi K2B
        199, // Ooshio K2
        468, // Asashio K2D
        490, // Arashio K2
        147, // Verniy
        469, // Kawakaze K2

        // Battleships
        // Nagato K2(541)
        541,
      ])(masterId)
  }

  // most of AV / LHA / AO are capable of equipping DLC,
  // we deal with this by blacklisting those incapables
  if (isOneOf([AV,LHA,AO])(stype)) {
    return !isOneOf(
      [
        445, // Akitsushima
        460, // Hayasui
        491, // Commandant Teste
        162, // Kamoi
      ])(masterId)
  }
}

export { canEquipDLC }
