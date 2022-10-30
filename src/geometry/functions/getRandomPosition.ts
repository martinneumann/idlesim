import { get_random_whole_number } from "../../util/functions/getRandomWholeNumber";
import { World } from "../../world/world";

export
    function get_random_position_2d(world: World) {
    return {
        x: get_random_whole_number(0, world.width),
        y: get_random_whole_number(0, world.height),
        z: 1,
    }
}






