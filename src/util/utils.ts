import { object_descriptor } from "./objectDescriptor";

export function get_color_by_object_type(object_type: object_descriptor): number[] {
	switch (object_type) {
		case object_descriptor.drinkable:
			// return blue
			return [10, 30, 255];

		case object_descriptor.edible:
			// return a reddish brown color
			return [235, 60, 40];

		case object_descriptor.building_material:
			// return a brownish color
			return [150, 100, 50];

		case object_descriptor.weapon:
			// return a silver color
			return [200, 200, 200];

		case object_descriptor.poisoned:
			// return a greenish color
			return [0, 255, 0];

		default:
			return [100, 155, 50];
	}
}