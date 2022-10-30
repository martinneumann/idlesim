import { WorldObject } from "../../objects/worldObjects"
import { World } from "../../world/world"
import { position } from "../../geometry/position"

export function get_nearby_objects(position: position, radius: number, world: World): WorldObject[] {
    let objects = []
    for (let obj of world.objects) {
        let distance = Math.sqrt(Math.pow(obj.position.x - position.x, 2) + Math.pow(obj.position.y - position.y, 2) + Math.pow(obj.position.z - position.z, 2))
        if (distance < radius) {
            objects.push(obj)
        }
    }

    return objects
}