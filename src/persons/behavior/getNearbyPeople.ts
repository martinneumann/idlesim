import { Person } from "../person";
import { position } from "../../geometry/position";
import { World } from "../../world/world";

export function get_nearby_people(position: position, radius: number, world: World): Person[] {
    let people: Person[] = [];
    for (let person of world.people) {
        let distance = Math.sqrt(Math.pow(person.position.x - position.x, 2) + Math.pow(person.position.y - position.y, 2) + Math.pow(person.position.z - position.z, 2))
        if (distance < radius) {
            people.push(person)
        }
    }
    return people
}


