import { Position } from "../geometry/position";
import { WorldObject } from "../objects/worldObjects";
import { Need } from "../persons/need";
import { Person } from "../persons/person";

export type Sound = {
  area_center: Position;
  area_radius: number;
} & (
  | {
      type: "messageNeed";
      content: Need;
      source?: Person;
    }
  | {
      type: "messageWorldObject";
      content: WorldObject;
      source?: Person;
    }
  | {
      type: "worldSound";
      description: string;
      source: WorldObject | undefined;
    }
);
