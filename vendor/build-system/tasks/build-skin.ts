import { BuildSystem } from '../build-system';
import { BodyPart } from '@box/schema/player/player-schema';

export async function invertSkinIndex(bs: BuildSystem, hash: string) {
  const skins = await bs.retrieveJSON(hash);
  const inverseIndex: { [part: string]: { [h: string]: string } } = {};
  const skinNames = Object.keys(skins);
  for (let i = 0; i < skinNames.length; ++i) {
    const skinName = skinNames[i];
    const skin = skins[skinName];
    Object.keys(skin).forEach((partName) => {
      if (!(partName in BodyPart) || !isNaN(parseInt(partName))) {
        return;
      }
      if (!(partName in inverseIndex)) {
        inverseIndex[partName] = {};
      }
      inverseIndex[partName][skin[partName]] = skinName;
    });
  }
  return bs.storeJSON(inverseIndex);
}
