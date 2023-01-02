import { Position } from "../geometry/position";
import { WorldObject } from "../objects/worldObjects";
import { Need } from "./need";
import { Person } from "./person";

export class MeetingPoint {
  position: Position = { x: 0, y: 0, z: 0 };
  type: "market" | "tavern" | "home" | "mayor" | "unspecified" = "unspecified";
}

export class Group {
  type: "family" | "settlement" = "family";
  name: string = "";
  description: string = "";
  members: Person[] = [];
  meeting_points: MeetingPoint[] = [];
  associated_objects: WorldObject[] = [];
  needs: Need[] = [];
}
