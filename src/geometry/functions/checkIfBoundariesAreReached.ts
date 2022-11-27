import { World } from "../../world/world";
import { Position } from "../position";

export function check_if_boundaries_are_reached(
  position: Position,
  world: World
) {
  // Checks if the person is outside the boundaries of the world
  if (
    position.x <= 0.0 ||
    position.x >= world.width ||
    position.y <= 0.0 ||
    position.y >= world.height ||
    position.z <= -10.0 ||
    position.z >= world.z_depth
  ) {
    // Move the person to the opposite side of the world
    if (position.x <= 0.0) {
      position.x = world.width - 1;
    }
    if (position.x >= world.width) {
      position.x = 1.0;
    }
    if (position.y <= 0.0) {
      position.y = world.height - 1;
    }
    if (position.y >= world.height) {
      position.y = 1.0;
    }
  }
}
