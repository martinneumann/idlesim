import { get_random_position_2d } from "../geometry/functions/getRandomPosition";
import { position } from "../geometry/position";
import { WorldObject } from "../objects/worldObjects";
import { actions } from "../util/actions";
import { is_in_reach } from "../util/functions/isInReach";
import { object_descriptor } from "../util/objectDescriptor";
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

  current_perceptions: WorldObject[] = [];
  current_people_in_range: Person[] = [];
  intention: actions = actions.idle;
  current_movement_goal: position = { x: 1, y: 1, z: 1 };
  current_action: actions = actions.idle;
  trade_timeout: number = 0;

  constructor(name: string, birthday: Date, position: position, world: World) {
    this.name = name;
    this.birthday = birthday;
    this.position = position;
    this.world = world;
    console.log(`A person by the name of ${this.name} now exists.`);
  }

  body_functions(intensity: number): boolean {
    this.trade_timeout > 0 ? this.trade_timeout-- : this.trade_timeout;
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
    for (let item of this.inventory)
      if (
        this.inventory.filter(
          (x) =>
            x.descriptors.includes(object_descriptor.edible) &&
            x.markedForTrade === false
        ).length > 1 &&
        this.hunger <= 60
      ) {
        item.markedForTrade = true;
        if (
          this.inventory.filter(
            (x) =>
              x.descriptors.includes(object_descriptor.drinkable) &&
              x.markedForTrade === false
          ).length > 1 &&
          this.thirst <= 60
        ) {
          item.markedForTrade = true;
        }
      }
  }

  decide() {
    if (this.thirst > 50) {
      this.intention = actions.drink;
      return;
    }
    if (this.hunger > 50) {
      this.intention = actions.eat;
      return;
    }
    if (this.inventory.length <= 3) {
      this.intention = actions.forage;
      return;
    }
    if (this.inventory.length > 3 && this.trade_timeout === 0) {
      this.intention = actions.trade;
      return;
    }

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
  }

  get_status() {}

  set_random_current_goal_position(check_if_already_set: boolean) {
    if (check_if_already_set) {
      if (this.position !== this.current_movement_goal) {
        return;
      }
    }
    this.current_movement_goal = get_random_position_2d(this.world);
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
    descriptor: object_descriptor[]
  ): WorldObject | undefined {
    return this.current_perceptions.find(
      (x) =>
        x.descriptors.find((y) => y === descriptor.find((x) => x === y)) &&
        x.belongsTo == ""
    );
  }

  do_action(): boolean {
    let action_intensity = 1;
    switch (this.intention) {
      case actions.idle:
        this.current_action = actions.idle;
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
          this.move_towards(this.current_movement_goal, this.skills.speed);
        }
        break;

      case actions.pick_up:
        break;
      case actions.build:
        break;
      case actions.bear_child:
        break;
      case actions.marry:
        break;
      case actions.forage:
        this.current_action = actions.forage;
        let nearby_object = this.check_for_free_nearby_object([
          object_descriptor.edible,
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
          this.set_random_current_goal_position(false);
          this.move_towards(this.current_movement_goal, this.skills.speed);
          break;
        }
    }

    return this.body_functions(action_intensity);
  }
}
