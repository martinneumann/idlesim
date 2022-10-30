import { position } from "../geometry/position";
import { object_descriptor } from "../util/objectDescriptor";

export class WorldObject {
		constructor(name: string, descriptors: object_descriptor[], pos: position, belongsTo: string) {
			this.name = name;
			this.descriptors = descriptors;
			this.position = pos;
			this.belongsTo = belongsTo;
		}
		name: string = "";
		descriptors: object_descriptor[] = [];
		position: position = { x: 1, y: 1, z: 1 };
		belongsTo: string = "";
		markedForTrade: boolean = false;
		value: number = 1;
	}