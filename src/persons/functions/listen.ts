import { Sound } from "../../world/sound";
import { Memory, MemoryType } from "../memory";

/**
 * Add sound to memory
 * @param sound
 */
export const listen = (sound: Sound, currentTime: number): Memory => {
  let newMemory = {
    age: 0,
    type: "memory" as MemoryType,
    expiresAt: currentTime + 3000,
  } as Memory;
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
