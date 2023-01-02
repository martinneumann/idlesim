import { Position } from "../geometry/position";
import { ObjectDescriptor } from "../util/objectDescriptor";

export class WorldObject {
  constructor(
    name: string,
    descriptors: ObjectDescriptor[],
    pos: Position,
    belongsTo: string
  ) {
    this.name = name;
    this.descriptors = descriptors;
    this.position = pos;
    this.belongsTo = belongsTo;
  }
  name: string = "";
  descriptors: ObjectDescriptor[] = [];
  position: Position = { x: 1, y: 1, z: 1 };
  belongsTo: string = "";
  markedForTrade: boolean = false;
  value: number = 1;
  age: number = 0;
  status: "alive" | "dead" | "rotten" = "alive";
}

export class Tree extends WorldObject {
  timeToHarvest: number = 50;
  health = Math.floor(Math.random() + 5) * 20;

  constructor(
    name: string,
    descriptors: ObjectDescriptor[],
    pos: Position,
    belongsTo: string,
    timeToHarvest: number
  ) {
    super(name, descriptors, pos, belongsTo);
    this.name = name;
    this.descriptors = descriptors;
    this.position = pos;
    this.belongsTo = belongsTo;
    this.timeToHarvest = timeToHarvest;
  }
}
