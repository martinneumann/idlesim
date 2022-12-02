import { helpers } from "rx";
import {
  get_random_position_2d,
  get_random_position_2d_with_min_distance,
} from "../geometry/functions/getRandomPosition";
import { Position } from "../geometry/position";
import { Tree, WorldObject } from "../objects/worldObjects";
import { actions } from "../util/actions";
import { get_random_whole_number } from "../util/functions/getRandomWholeNumber";
import { is_in_reach } from "../util/functions/isInReach";
import { object_descriptor } from "../util/objectDescriptor";
import { get_random_element } from "../util/utils";
import { World } from "../world/world";
import { get_nearby_people } from "./behavior/getNearbyPeople";
import { get_nearby_objects } from "./functions/getNearbyObjects";
import { Group } from "./group";
import { Job } from "./job";
import { Memory } from "./memory";
import { Need } from "./need";
import { Relationship } from "./relationship";
import { Skills } from "./skills";

const need_food_map = [
  { ["food"]: "orchadist" },
  { ["drink"]: "water carrier" },
  { ["entertainment"]: "bard" },
];

export class Person {
  world: World;
  name: string = "Unnamed Person";
  skills: Skills = new Skills();
  age: number = 0;
  position: Position = { x: 1, y: 1, z: 1 };
  hunger: number = 0;
  thirst: number = 0;
  happiness: number = 80;
  energy: number = 100;

  money: number = 0;

  relationships: Relationship[] = [];

  // Groups
  groups: Group[] = [];

  // Objects carried on the person
  inventory: WorldObject[] = [];

  // Objects are considered home
  homes: WorldObject[] = [];

  memory: Memory[] = [];

  needs: Need[] = [];

  job: Job = {} as Job;

  // Possible contract offers
  offers: Need[] = [];

  current_perceptions: WorldObject[] = [];
  current_people_in_range: Person[] = [];
  intention: actions = actions.idle;
  current_movement_goal: Position = { x: 1, y: 1, z: 1 };
  current_action: actions = actions.idle;
  trade_timeout: number = 0;
  talk_timeout: number = 0;

  constructor(name: string, position: Position, world: World, group?: Group) {
    this.name = name;
    this.position = position;
    this.world = world;
    this.needs.push({
      description: "food",
      recurring: true,
      object_descriptors: [object_descriptor.edible],
    } as Need);
    this.needs.push({
      description: "drink",
      recurring: true,
      object_descriptors: [object_descriptor.drinkable],
    } as Need);
    this.needs.push({
      description: "entertainment",
      recurring: true,
    } as Need);
    this.needs.push({
      description: "safety",
      recurring: true,
    } as Need);
    if (group) this.groups.push(group);
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
      this.energy -= intensity;
      return true;
    }
  }

  assign_job() {}

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
    // Eat or drink
    if (
      (this.thirst > 50 || this.hunger > 50) &&
      this.current_action !== actions.sleep
    ) {
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

    // Sleep
    if (
      this.energy <= 20 ||
      (this.current_action === actions.sleep && this.energy < 100)
    ) {
      this.intention = actions.sleep;
      return;
    }

    // Evaluate job
    let mems = this.memory.filter((x) => x.category === "need");
    if (!this.job?.title && mems.length > 0) {
      this.intention = actions.talk;
      return;
    }
    // Set needs and offers

    // offers

    // Forage for food for storage
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

    // Build
    if (
      this.inventory.filter((x) =>
        x.descriptors.some((y) => y === object_descriptor.building_material)
      ).length > 3 &&
      !this.memory.find((x) => x.description === "This is where my home is")
    ) {
      this.intention = actions.build;
      return;
    }

    // Go to market square
    let market = this.groups
      .find((x) => x.type === "settlement")
      ?.meeting_points.find((y) => y.type === "market");
    if (market && this.get_distance(this.position, market.position) > 5) {
      this.current_movement_goal = market.position;
      this.move_towards(this.current_movement_goal, this.skills.speed);
      return;
    }

    // Talk
    let a = get_nearby_people(this.position, 10, this.world);
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
      if (!object.descriptors.includes(object_descriptor.regenerative)) {
        world.objects.splice(world.objects.indexOf(object), 1);
      }
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
          memory.related_objects?.find((object) => object === perception)
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

  get_distance(pos1: Position, pos2: Position) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
  }

  get_closest_object(
    objects: WorldObject[],
    own_position: Position,
    exclusion_distance: number
  ) {
    let closest = objects
      .map((obj) => ({
        object: obj,
        distance: this.get_distance(own_position, obj.position),
      }))
      .filter((x) => x.distance >= exclusion_distance)
      .sort((x, y) => x.distance - y.distance);

    return closest[0];
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

  set_current_goal_position(position: Position) {
    this.current_movement_goal = position;
  }

  check_if_goal_position_reached(tolerance?: number): boolean {
    if (tolerance) {
      if (
        this.get_distance(this.current_movement_goal, this.position) < tolerance
      ) {
        return true;
      } else return false;
    }
    if (this.position === this.current_movement_goal) {
      return true;
    }
    return false;
  }

  move_towards(target: Position, speed: number) {
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
    const obj = this.get_closest_object(
      this.current_perceptions.filter(
        (x) =>
          x.descriptors.some((y) => descriptors.some((desc) => desc === y)) &&
          x.belongsTo == ""
      ),
      this.position,
      0
    )?.object;

    return obj;
  }

  do_action(): boolean {
    let action_intensity = 0.1;
    switch (this.intention) {
      case actions.idle:
        this.current_action = actions.idle;

        // Move to home, if exists
        let homeMemory = this.get_closest_object(this.homes, this.position, 0);

        if (homeMemory) {
          let pos = homeMemory.object.position;

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

      case actions.sleep:
        if (
          this.energy <= 0 ||
          (this.current_action === actions.sleep && this.energy < 100)
        ) {
          this.current_action = actions.sleep;
          this.energy += 2;
          break;
        }
        // If owns house -> go there and sleep
        if (this.homes.length > 0) {
          // Get closest home
          let home = this.get_closest_object(this.homes, this.position, 0);

          if (home) {
            // Set home as goal
            this.current_movement_goal = home.object.position;
            if (!this.check_if_goal_position_reached()) {
              this.move_towards(this.current_movement_goal, this.skills.speed);
            } else {
              this.current_action = actions.sleep;
              this.energy += 4;
            }
          }
        } else {
          this.current_action = actions.sleep;
          this.energy += 2;
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
        // Has material?
        if (
          this.inventory.filter((x) =>
            x.descriptors.some((y) => y === object_descriptor.building_material)
          ).length > 3
        ) {
          this.current_action = actions.build;
          // Move to building space
          // If is member of town, move to town market
          let settlement = this.groups.find((x) => x.type === "settlement");
          if (settlement) {
            if (
              this.get_distance(
                this.current_movement_goal,
                settlement.meeting_points.find((x) => x.type === "market")!
                  .position
              ) < 30
            ) {
              if (this.check_if_goal_position_reached(80)) {
                let newShack = {
                  belongsTo: this.name,
                  descriptors: [object_descriptor.wood_shack],
                  markedForTrade: false,
                  name: this.name + "s wooden shack",
                  position: this.position,
                  value: 100,
                } as WorldObject;
                this.homes.push(newShack);
                this.world.objects.push(newShack);
                this.memory.push({
                  age: 0,
                  description: "This is where my home is",
                  position: this.position,
                  related_objects: [],
                  category: "house",
                  related_persons: [this],
                } as Memory);
                settlement.associated_objects.push(newShack);
                this.intention = actions.idle;
                break;
              } else {
                this.move_towards(
                  this.current_movement_goal,
                  this.skills.speed
                );
                break;
              }
            } else {
              this.current_movement_goal = settlement.meeting_points.find(
                (x) => x.type === "market"
              )!.position;

              this.move_towards(this.current_movement_goal, this.skills.speed);
              break;
            }
          } else {
            // @todo: remove wood form inventory

            let newShack = {
              belongsTo: this.name,
              descriptors: [object_descriptor.wood_shack],
              markedForTrade: false,
              name: this.name + "s wooden shack",
              position: this.position,
              value: 100,
            } as WorldObject;

            this.homes.push(newShack);
            this.world.objects.push(newShack);
            this.memory.push({
              age: 0,
              description: "This is where my home is",
              position: this.position,
              related_objects: [],
              category: "house",
              related_persons: [this],
            } as Memory);
            this.intention = actions.idle;
            break;
          }
        }

        this.intention = actions.fell_tree;
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

        if (this.talk_timeout > 0) break; // boring

        let partners = get_nearby_people(this.position, 5, this.world);
        if (partners.length > 0) {
          const partner: Person = get_random_element(partners);

          // Decide topic
          let topic: Memory;
          let mems = this.memory.filter((x) => x.category === "need");
          if (mems.length > 0 && this.job?.title === undefined) {
            let randomNeedToFulfill: Memory = get_random_element(mems);
            topic = {
              age: 0,
              category: "job_proposition",
              description: randomNeedToFulfill.description,
            } as Memory;
          } else if (Math.random() > 0.4)
            topic = get_random_element(this.memory) as Memory;
          else {
            let foundNeed: Need = get_random_element(this.needs);
            topic = {
              age: 0,
              category: "need",
              related_persons: [this],
              description: foundNeed.description,
              position: {} as Position,
              related_objects: [],
            } as Memory;
          }

          let message;
          if (topic.category === "house") {
            message = `${Math.floor(
              this.get_distance(this.position, topic.position)
            )} steps from here. ${topic.description}`;

            if (
              !partner.memory.find(
                (x: any) => x.related_objects === topic.related_objects
              )
            ) {
              partner.memory.push({
                age: 0,
                description: "House of " + this.name,
                position: topic.position,
              } as Memory);
            }
          } else if (topic.category === "need") {
            message = `Someone should really provide some ${topic.description}...`;

            let foundMemory = partner.memory.find(
              (x) => x.description === topic.description
            );
            if (!foundMemory) {
              partner.memory.push({
                age: 0,
                description: topic.description,
                position: {} as Position,
                category: "need",
                related_persons: [this],
                related_objects: [],
              } as Memory);
            } else {
              foundMemory.related_persons.push(this);
              foundMemory.age = 0;
            }
          } else if (topic.category === "job_proposition") {
            let title = "peasant";
            switch (topic.description) {
              case "food":
                title = "orchardist";
                break;
              case "drink":
                title = "water carrier";
                break;
              case "entertainment":
                title = "bard";
                break;
            }
            this.job = {
              fulfilled_needs: [{ description: topic.description } as Need],
              title: title,
            } as Job;
            message = `I became a ${title}`;
            if (
              !partner.memory.find(
                (x: Memory) => x.description === topic.description
              )
            ) {
              partner.memory.push(topic);
            }
          } else {
            message = `I know there is a ${
              topic.description
            } about ${Math.floor(
              this.get_distance(this.position, topic.position)
            )} steps from here. I was there ${topic.age} hours ago.`;

            if (
              !partner.memory.find(
                (x: any) => x.related_objects === topic.related_objects
              )
            ) {
              partner.memory.push(topic);
            }
          }
          this.talk_timeout = 30;
          this.world.append_to_log(
            this.name,
            `To ${partner.name}: ${message}.`
          );
        }
    }

    return this.body_functions(action_intensity);
  }
}
