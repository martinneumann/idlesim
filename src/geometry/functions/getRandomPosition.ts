import { get_random_whole_number } from "../../util/functions/getRandomWholeNumber";
import { World } from "../../world/world";
import { position } from "../position";

export function get_random_position_2d(world: World) {
  return {
    x: get_random_whole_number(0, world.width),
    y: get_random_whole_number(0, world.height),
    z: 1,
  };
}

export function get_random_position_2d_with_min_distance(
  world: World,
  position: position
) {
  if (Math.random() > 0.75)
    return {
      x: position.x + get_random_whole_number(100, 200) * 50,
      y: position.y + get_random_whole_number(100, 200) * 50,
      z: 1,
    };
  else if (Math.random() > 0.75)
    return {
      x: position.x + get_random_whole_number(-10, -100) * 50,
      y: position.y + get_random_whole_number(-10, -100) * 50,
      z: 1,
    };
  else if (Math.random() > 0.75)
    return {
      x: position.x + get_random_whole_number(-10, -100) * 50,
      y: position.y + get_random_whole_number(10, 100) * 50,
      z: 1,
    };
  else
    return {
      x: position.x + get_random_whole_number(10, 100) * 50,
      y: position.y + get_random_whole_number(-10, -100) * 50,
      z: 1,
    };
}
