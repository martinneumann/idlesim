import { Sound } from "../../world/sound";
import { Memory } from "../memory";

/**
 * Add sound to memory
 * @param sound
 */
export const listen = (sound: Sound): Memory => {
  let newMemory = { age: 0 };
  switch (sound.type) {
    case "messageNeed":
      break;

    case "worldSound":
      break;
    default:
      break;
  }
  return newMemory;
};
