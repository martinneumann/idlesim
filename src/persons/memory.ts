import { Position } from "../geometry/position";
import { WorldObject } from "../objects/worldObjects";
import { Person } from "./person";

/**
 * Anything that is remembered by that person
 */
export class Memory {
  related_objects: WorldObject[] = [];
  position: Position = { x: 0, y: 0, z: 0 };
  description: string = "";
  age: number = 0;
  related_persons: Person[] = [];
  category: "house" | "need" | "job_proposition" | "unspecified" =
    "unspecified";
}
