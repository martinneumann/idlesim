import { helpers } from "rx";
import {
  get_random_position_2d,
  get_random_position_2d_with_min_distance,
} from "../geometry/functions/getRandomPosition";
import { position } from "../geometry/position";
import { Tree, WorldObject } from "../objects/worldObjects";
import { actions } from "../util/actions";
import { get_random_whole_number } from "../util/functions/getRandomWholeNumber";
import { is_in_reach } from "../util/functions/isInReach";
import { object_descriptor } from "../util/objectDescriptor";
import { get_random_element } from "../util/utils";
import { World } from "../world/world";
import { get_nearby_people } from "./behavior/getNearbyPeople";
import { get_nearby_objects } from "./functions/getNearbyObjects";
import { Memory } from "./memory";
import { Relationship } from "./relationship";
import { Skills } from "./skills";

export class Person {
  world: World;
  name: string = "Unnamed Person";
  skills: Skills = new Skills();
  age: number = 0;
  position: position = { x: 1, y: 1, z: 1 };
  hunger: number = 0;
  thirst: number = 0;

  money: number = 100;

  birthday: Date;

  relationships: Relationship[] = [];
  inventory: WorldObject[] = [];
  memory: Memory[] = [];
  object_needs: object_descriptor[] = [];

  current_perceptions: WorldObject[] = [];
  current_people_in_range: Person[] = [];
  intention: actions = actions.idle;
  current_movement_goal: position = { x: 1, y: 1, z: 1 };
  current_action: actions = actions.idle;
  trade_timeout: number = 0;
  talk_timeout: number = 0;

  constructor(name: string, birthday: Date, position: position, world: World) {
    this.name = name;
    this.birthday = birthday;
    this.position = position;
    this.world = world;
    console.log(`A person by the name of ${this.name} now exists.`);
  }

  body_functions(intensity: number): boolean {
    this.trade_timeout > 0 ? this.trade_timeout-- : this.trade_timeout;
    this.talk_timeout > 0 ? this.talk_timeout-- : this.talk_timeout;
    if (this.hunger >= 100) {
      console.log(`${this.name} died from starvation.`);
      return false;
    } else if (this.thirst >= 100) {
      console.log(`${this.name} died from thirst.`);
      return false;
    } else {
      this.hunger += intensity;
      this.thirst += intensity;
      return true;
    }
  }

  print_intention() {}

  organize() {
    // Set superfluous items to markedForTrade if not hungry or thirsty
    for (let item of this.inventory) {
      if (
        this.inventory.filter(
          (x) =>
            x.descriptors.includes(object_descriptor.edible) &&
            x.markedForTrade === false
        ).length > 3 &&
        this.hunger <= 60
      ) {
        item.markedForTrade = true;
      }
      if (
        this.inventory.filter(
          (x) =>
            x.descriptors.includes(object_descriptor.drinkable) &&
            x.markedForTrade === false
        ).length > 3 &&
        this.thirst <= 60
      ) {
        item.markedForTrade = true;
      }
    }
  }

  decide() {
    if (this.thirst > 50 || this.hunger > 50) {
      if (
        this.inventory.some(
          (x) =>
            x.descriptors.some((y) => y === object_descriptor.drinkable) &&
            this.thirst > 50
        )
      ) {
        this.intention = actions.drink;
        return;
      }

      if (
        this.inventory.some(
          (x) =>
            x.descriptors.some((y) => y === object_descriptor.edible) &&
            this.hunger > 50
        )
      ) {
        this.intention = actions.eat;
        return;
      } else this.intention = actions.forage;
      return;
    }

    if (
      this.inventory.length <= 6 ||
      this.inventory.filter((x) =>
        x.descriptors.some((y) => y === object_descriptor.edible)
      ).length <= 6 ||
      this.inventory.filter((x) =>
        x.descriptors.some((y) => y === object_descriptor.drinkable)
      ).length <= 6
    ) {
      this.intention = actions.forage;
      return;
    }
    if (
      this.inventory.find((x) => x.markedForTrade) &&
      this.trade_timeout === 0
    ) {
      this.intention = actions.trade;
      return;
    }

    // Fell tree
    if (
      this.inventory.filter((x) =>
        x.descriptors.some((y) => y === object_descriptor.building_material)
      ).length <= 3
    ) {
      this.intention = actions.fell_tree;
      return;
    }
    if (
      this.inventory.filter((x) =>
        x.descriptors.some((y) => y === object_descriptor.building_material)
      ).length > 3 &&
      !this.memory.find((x) => x.description === "This is where my home is")
    ) {
      this.intention = actions.build;
      return;
    }

    let a = get_nearby_people(this.position, 10, this.world);
    console.log(a.length);
    if (a.length > 0) {
      this.intention = actions.talk;
      return;
    }

    // Idle
    this.intention = actions.idle;
  }

  pick_up(object: WorldObject, world: World) {
    if (object.belongsTo != "") {
    } else {
      object.belongsTo = this.name;
      this.inventory.push(object);
      if (!object.descriptors.includes(object_descriptor.regenerative))
        world.objects.splice(world.objects.indexOf(object), 1);
      this.skills.perception += 1;
    }
  }

  chop_tree(tree: Tree, world: World) {
    tree.health -= get_random_whole_number(1, 5);
    if (tree.health < 0) {
      for (let i = 0; i < 10; i++) {
        this.world.objects.push(
          new WorldObject(
            "wood",
            [object_descriptor.building_material],
            {
              x: tree.position.x + i * 2,
              y: tree.position.y + i,
              z: tree.position.z,
            },
            ""
          )
        );
      }
      this.inventory.push({
        belongsTo: this.name,
        descriptors: [object_descriptor.building_material],
        markedForTrade: false,
        name: "wood",
        position: this.position,
        value: 3,
      } as WorldObject);
      world.objects.splice(world.objects.indexOf(tree), 1);
    }
  }

  perceive(perception_value: number) {
    this.current_perceptions = Array<WorldObject>();
    this.current_perceptions = get_nearby_objects(
      this.position,
      perception_value,
      this.world
    );

    this.current_people_in_range = Array<Person>();
    this.current_people_in_range = get_nearby_people(
      this.position,
      perception_value * 10,
      this.world
    );

    this.update_memories(this.current_perceptions);
  }

  update_memories(current_perceptions: WorldObject[]) {
    // Forget old memories
    this.memory.forEach((memory) => {});
    this.memory = this.memory.filter((x) => x.age < 3000);

    // Add current perceptions
    current_perceptions
      .filter((perception) =>
        perception.descriptors.some(
          (perc) => perc === object_descriptor.fruit_tree
        )
      )
      .forEach((perception) => {
        let mem = this.memory.find((memory) =>
          memory.related_objects.find((object) => object === perception)
        );
        if (mem === undefined) {
          this.memory.push({
            description: perception.name,
            position: perception.position,
            related_objects: [perception],
            age: 0,
          } as Memory);
        } else {
          mem.age = 0;
        }
      });

    this.memory.forEach((memory) => {
      memory.age += 1;
    });
  }

  get_status() {}

  get_distance(pos1: position, pos2: position) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
  }

  get_closest_object(
    objects: WorldObject[],
    own_position: position,
    exclusion_distance: number
  ) {
    let closest = objects
      .map((obj) => ({
        object: obj,
        distance: this.get_distance(own_position, obj.position),
      }))
      .filter((x) => x.distance > exclusion_distance)
      .sort((x) => x.distance)[0];

    return closest;
  }

  get_objects_with_descriptors(
    objects: WorldObject[],
    descriptors: object_descriptor[]
  ) {
    let test = objects.filter((object) =>
      object.descriptors.some((descriptor) => descriptors.includes(descriptor))
    );
    return test;
  }

  /**
   * Only fruit trees for now
   * @param descriptor what to look for. gets the first one in the memory.
   */
  find_nearest_memory_fit(
    descriptors: object_descriptor[],
    maxAge = 1000,
    minAge = 100
  ) {
    const returnval = this.get_closest_object(
      this.get_objects_with_descriptors(
        this.memory
          .filter((x) => x.age < maxAge)
          .filter((x) => x.age > minAge)
          .map((x) => x.related_objects)
          .flat(),
        descriptors
      ),
      this.position,
      1
    );

    return returnval;
  }

  set_random_current_goal_position(check_if_already_set: boolean) {
    if (check_if_already_set) {
      if (this.position !== this.current_movement_goal) {
        return;
      }
    }
    this.current_movement_goal = get_random_position_2d_with_min_distance(
      this.world,
      this.position
    );
  }

  set_center_as_goal_position() {
    this.current_movement_goal = {
      x: this.world.width / 2,
      y: this.world.height / 2,
      z: 1,
    };
  }

  set_current_goal_position(position: position) {
    this.current_movement_goal = position;
  }

  check_if_goal_position_reached(): boolean {
    if (this.position === this.current_movement_goal) {
      return true;
    }
    return false;
  }

  move_towards(target: position, speed: number) {
    let distance = Math.sqrt(
      Math.pow(target.x - this.position.x, 2) +
        Math.pow(target.y - this.position.y, 2) +
        Math.pow(target.z - this.position.z, 2)
    );

    let direction = {
      x: target.x - this.position.x,
      y: target.y - this.position.y,
      z: target.z - this.position.z,
    };
    let direction_length = Math.sqrt(
      Math.pow(direction.x, 2) +
        Math.pow(direction.y, 2) +
        Math.pow(direction.z, 2)
    );
    let direction_unit = {
      x: direction.x / direction_length,
      y: direction.y / direction_length,
      z: direction.z / direction_length,
    };

    if (distance < speed) {
      this.position = target;
    } else {
      let new_position = {
        x: this.position.x + direction_unit.x * this.skills.speed,
        y: this.position.y + direction_unit.y * this.skills.speed,
        z: this.position.z + direction_unit.z * this.skills.speed,
      };
      this.position = new_position;
    }
  }

  check_for_free_nearby_object(
    descriptors: object_descriptor[]
  ): WorldObject | undefined {
    return this.current_perceptions.filter(
      (x) =>
        x.descriptors.some((y) => descriptors.some((desc) => desc === y)) &&
        x.belongsTo == ""
    )[0];
  }

  do_action(): boolean {
    let action_intensity = 0.1;
    switch (this.intention) {
      case actions.idle:
        this.current_action = actions.idle;

        // Move to home, if exists
        let homeMemory = this.memory.find(
          (x) => x.description === "This is where my home is"
        );
        if (homeMemory) {
          let pos = this.memory.find(
            (x) => x.description === "This is where my home is"
          )?.position;

          if (pos && this.current_movement_goal !== pos)
            this.current_movement_goal = pos;
          if (pos && !this.check_if_goal_position_reached()) {
            this.move_towards(this.current_movement_goal, this.skills.speed);
          }
        }
        break;

      case actions.drink:
        let drink = this.inventory.find((x) =>
          x.descriptors.find((y) => y === object_descriptor.drinkable)
        );
        if (drink) {
          this.thirst -= 60;
          this.inventory.splice(
            this.inventory.findIndex((x) => x == drink),
            1
          );
          break;
        } else {
          let nearby_object = this.check_for_free_nearby_object([
            object_descriptor.drinkable,
          ]);
          if (nearby_object) {
            if (
              is_in_reach(
                nearby_object.position,
                this.position,
                this.skills.reach
              )
            ) {
              this.pick_up(nearby_object, this.world);
              break;
            } else {
              this.move_towards(nearby_object.position, this.skills.speed);
              break;
            }
          } else {
            this.move_towards(this.current_movement_goal, this.skills.speed);
            break;
          }
        }

      case actions.eat:
        let food = this.inventory.find((x) =>
          x.descriptors.find((y) => y === object_descriptor.edible)
        );
        if (food) {
          this.hunger -= 60;
          this.skills.speed += 1;
          this.inventory.splice(
            this.inventory.findIndex((x) => x == food),
            1
          );
          break;
        } else {
          let nearby_object = this.check_for_free_nearby_object([
            object_descriptor.edible,
          ]);
          if (nearby_object) {
            if (
              is_in_reach(
                nearby_object.position,
                this.position,
                this.skills.reach
              )
            ) {
              this.pick_up(nearby_object, this.world);
              break;
            } else {
              this.move_towards(nearby_object.position, this.skills.speed);
              break;
            }
          } else {
            this.move_towards(this.current_movement_goal, this.skills.speed);
            break;
          }
        }

      case actions.walk:
        break;

      case actions.trade:
        // Check if anyone is nearby who also wants to converse.
        // Always gets the first one in list @TODO
        let nearby_trader = this.current_people_in_range.filter(
          (x) => x.intention == actions.trade
        )[0];

        if (
          !!nearby_trader &&
          nearby_trader !== this &&
          nearby_trader.inventory.filter((x) => x.markedForTrade === true)
            .length > 0 &&
          this.inventory.filter((x) => x.markedForTrade === true).length > 0
        ) {
          // Exchange items that are set to tradeable and are more or less the same value.
          this.current_action = actions.trade;
          let exchange_items = this.inventory.filter(
            (x) => x.markedForTrade === true
          );
          let other_exchange_items = nearby_trader.inventory.filter(
            (x) => x.markedForTrade === true
          );

          let value_exchange_items = exchange_items.reduce(
            (acc, cur) => acc + cur.value,
            0
          );
          let value_other_exchange_items = other_exchange_items.reduce(
            (acc, cur) => acc + cur.value,
            0
          );

          // Exchange items
          this.inventory.push(...other_exchange_items);
          nearby_trader.inventory = nearby_trader.inventory.filter(
            (x) => !other_exchange_items.includes(x)
          );

          nearby_trader.inventory.push(...exchange_items);
          this.inventory = this.inventory.filter(
            (x) => !exchange_items.includes(x)
          );
          this.trade_timeout = 70;
          nearby_trader.trade_timeout = 70;
        } else {
          // Look for other trader
          this.move_towards(this.current_movement_goal, this.skills.speed);
        }
        break;

      case actions.pick_up:
        break;
      case actions.build:
        if (
          this.inventory.filter((x) =>
            x.descriptors.some((y) => y === object_descriptor.building_material)
          ).length > 3
        ) {
          console.log("building");
          // @todo: remove wood form inventory

          let newShack = {
            belongsTo: this.name,
            descriptors: [object_descriptor.wood_shack],
            markedForTrade: false,
            name: this.name + "s wooden shack",
            position: this.position,
            value: 100,
          } as WorldObject;
          this.world.objects.push(newShack);
          this.memory.push({
            age: 0,
            description: "This is where my home is",
            position: this.position,
            related_objects: [],
          } as Memory);
          console.log(JSON.stringify(this.memory));
        } else {
          console.log("could not build");
          let a =
            this.inventory.filter((x) =>
              x.descriptors.some(
                (y) => y === object_descriptor.building_material
              )
            ).length > 3;
          console.log(a);
        }

        this.intention = actions.idle;
        break;
      case actions.bear_child:
        break;

      case actions.fell_tree:
        let nearby_wood = this.check_for_free_nearby_object([
          object_descriptor.building_material,
        ]);
        if (nearby_wood) {
          if (
            is_in_reach(nearby_wood.position, this.position, this.skills.reach)
          ) {
            this.pick_up(nearby_wood, this.world);
            break;
          } else {
            this.move_towards(nearby_wood.position, this.skills.speed);
            break;
          }
        }
        let nearby_tree = this.check_for_free_nearby_object([
          object_descriptor.walnut_tree,
          object_descriptor.willow_tree,
        ]) as Tree;
        if (nearby_tree) {
          if (
            is_in_reach(nearby_tree.position, this.position, this.skills.reach)
          ) {
            this.current_action = actions.fell_tree;
            this.chop_tree(nearby_tree, this.world);
            break;
          } else {
            this.move_towards(nearby_tree.position, this.skills.speed);
            break;
          }
        }
        break;
      case actions.forage:
        this.current_action = actions.forage;
        let desired_descriptors = [];

        // Hungry or thirsty
        if (this.hunger > 50 || this.thirst > 50) {
          if (this.thirst > 50)
            desired_descriptors.push(object_descriptor.drinkable);
          if (this.hunger > 50)
            desired_descriptors.push(object_descriptor.edible);
        } else {
          // Not hungry or thirsty
          if (
            this.inventory.filter((x) =>
              x.descriptors.some((y) => y === object_descriptor.drinkable)
            ).length < 10
          )
            desired_descriptors.push(object_descriptor.drinkable);
          if (
            this.inventory.filter((x) =>
              x.descriptors.some((y) => y === object_descriptor.edible)
            ).length < 10
          )
            desired_descriptors.push(object_descriptor.edible);
        }

        let nearby_object = this.check_for_free_nearby_object([
          ...desired_descriptors,
        ]);
        if (nearby_object) {
          if (
            is_in_reach(
              nearby_object.position,
              this.position,
              this.skills.reach
            )
          ) {
            this.pick_up(nearby_object, this.world);
            break;
          } else {
            this.move_towards(nearby_object.position, this.skills.speed);
            break;
          }
        } else {
          if (desired_descriptors.includes(object_descriptor.edible)) {
            desired_descriptors.push(object_descriptor.fruit_tree);
          }
          const memory_object = this.find_nearest_memory_fit(
            desired_descriptors,
            100
          );
          if (memory_object) {
            this.current_movement_goal = memory_object.object.position;
          } else if (this.check_if_goal_position_reached())
            this.set_random_current_goal_position(false);
          else this.move_towards(this.current_movement_goal, this.skills.speed);
          break;
        }
      case actions.talk:
        this.current_action = actions.talk;
        let partners = get_nearby_people(this.position, 5, this.world);
        if (partners.length > 0) {
          let partner = partners[0];
          let topic = get_random_element(this.memory) as Memory;
          let message;
          if (topic.description.includes("home")) {
            message = `${this.get_distance(
              this.position,
              topic.position
            )} steps from here. ${topic.description}`;

            if (
              !partner.memory.find(
                (x) => x.related_objects === topic.related_objects
              )
            ) {
              partner.memory.push({
                age: 0,
                description: "House of " + this.name,
                position: topic.position,
              } as Memory);
            }
          } else {
            message = `I know there is a ${
              topic.description
            } about ${this.get_distance(
              this.position,
              topic.position
            )} steps from here. I was there ${topic.age} hours ago.`;

            if (
              !partner.memory.find(
                (x) => x.related_objects === topic.related_objects
              )
            ) {
              partner.memory.push(topic);
            }
          }
          this.talk_timeout = 200;
          this.world.append_to_log(
            this.name,
            `To ${partner.name}: ${message}.`
          );
        }
    }

    return this.body_functions(action_intensity);
  }
}
