import { Position } from "../geometry/position";
import { WorldObject } from "../objects/worldObjects";

/**
 * Anything that is remembered by that person
 */
export class Memory {
  related_objects: WorldObject[] = [];
  position: Position = { x: 0, y: 0, z: 0 };
  description: string = "";
  age: number = 0;
  category: "house" | "unspecified" = "unspecified";
}
