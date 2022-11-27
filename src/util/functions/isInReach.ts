import { Position } from "../../geometry/position";

export function is_in_reach(
  position1: Position,
  position2: Position,
  distance: number
): boolean {
  return (
    Math.abs(position1.x - position2.x) <= distance &&
    Math.abs(position1.y - position2.y) <= distance &&
    Math.abs(position1.z - position2.z) <= distance
  );
}
