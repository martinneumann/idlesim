import { timer } from 'rxjs';
import { graphics } from './graphics';	

namespace sim {
	enum actions {
		idle = 1,
		walk = 2,
		eat = 3,
		converse = 4,
		drink = 5,
		pick_up = 6,
		fell = 7,
		build = 8,
		marry = 9,
		bear_child = 10,
		sleep = 11,
		search = 12,
		forage = 13,
	}

	const natural_drinks = [
		"water",
		"wine",
		"beer",
		"whiskey",
		"rum",
		"gin",
		"tequila",
		"liquor",
		"bourbon",
		"brandy",
		"schnapps",
		"absinthe",
		"champagne",
		"cognac",
		"vodka",
		"whiskey",
		"scotch",
		"coffee",
		"milk",
		"water",
		"orange juice",
		"apple juice",
		"lemonade",
		"soda",
		"beer"
	];

	const natural_fruit_forageable = [
		"apple",
		"banana",
		"orange",
		"peach",
		"pear",
		"plum",
		"strawberry",
		"blueberry",
		"raspberry",
		"blackberry",
		"cranberry",
		"grapefruit",
		"apricot",
		"mango",
		"nectarine",
		"pomegranate",
		"peach",
		"nectarine",
		"pomegranate",
		"cherry",
		"persimmon",
		"date",
		"fig",
		"tangerine",
		"lemon",
		"lime",
		"coconut",
	];

	const tree_types = [
		"oak",
		"maple",
		"pine",
		"willow",
		"ash",
		"birch",
		"cedar",
		"elm",
		"hickory",
		"sequoia",
		"spruce",
		"sycamore",
		"whitebeam"
	];



	enum object_descriptor {
		edible = 1,
		drinkable = 2,
		poisoned = 3,
		weapon = 4,
		building_material = 5
	}

	interface position {
		x: number,
		y: number,
		z: number,
	}

	function capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function create_name(): string {
		let vowels = 'aeiouäöüeë';
		let consonants = 'bcdfghjklmnpqrstvwxyz';
		let first_name = ""
		let last_name = "";
		for (let i = 0; i < (Math.floor(Math.random() * 10) + 1); i++) {
			if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
				first_name += vowels[Math.floor(Math.random() * vowels.length)]
			} else {
				first_name += consonants[Math.floor(Math.random() * consonants.length)]
			}
		}

		for (let i = 0; i < (Math.floor(Math.random() * 15) + 4); i++) {
			if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
				last_name += vowels[Math.floor(Math.random() * vowels.length)]
			} else {
				last_name += consonants[Math.floor(Math.random() * consonants.length)]
			}
		}
		first_name = capitalizeFirstLetter(first_name)
		last_name = capitalizeFirstLetter(last_name)
		return first_name + " " + last_name
	}

	function decideWithProbability(probability: number): boolean {
		return get_random_whole_number(0, 100) < probability;
	}

	function get_random_whole_number(min: number, max: number) {
		return Math.floor(Math.random() * (max - min)) + min
	}

	function is_in_reach(position1: position, position2: position, distance: number): boolean {
		return Math.abs(position1.x - position2.x) <= distance && Math.abs(position1.y - position2.y) <= distance && Math.abs(position1.z - position2.z) <= distance
	}

	function get_nearby_objects(position: position, radius: number): WorldObject[] {
		let objects = []
		for (let i = 0; i < world.objects.length; i++) {
			let obj = world.objects[i]
			let distance = Math.sqrt(Math.pow(obj.position.x - position.x, 2) + Math.pow(obj.position.y - position.y, 2) + Math.pow(obj.position.z - position.z, 2))
			if (distance < radius) {
				objects.push(obj)
			}
		}
		return objects
	}

	function get_random_position() {
		return {
			x: get_random_whole_number(0, world.width),
			y: get_random_whole_number(0, world.height),
			z: get_random_whole_number(0, world.z_depth)
		}
	}

	function get_nearby_people(position: position, radius: number): Person[] {
		let people = []
		for (let i = 0; i < world.people.length; i++) {
			let person = world.people[i]
			let distance = Math.sqrt(Math.pow(person.position.x - position.x, 2) + Math.pow(person.position.y - position.y, 2) + Math.pow(person.position.z - position.z, 2))
			if (distance < radius) {
				people.push(person)
			}
		}
		return people
	}

	class Skills {
		perception: number = 30
		speed: number = 50
		reach: number = 5
	}

	class Person {
		name: string = "Unnamed Person";
		skills: Skills = new Skills();
		age: number = 0;
		position: position = { x: 1, y: 1, z: 1 };
		hunger: number = 0;
		thirst: number = 0;

		birthday: Date;

		relationships: Relationship[] = [];
		inventory: WorldObject[] = [];
		memory: Memory[] = [];

		current_perceptions: WorldObject[] = [];
		intention: actions = actions.idle;
		current_movement_goal: position = this.position;
		current_action: actions = actions.idle;

		constructor(name: string, birthday: Date, position: position) {
			this.name = name;
			this.birthday = birthday;
			this.position = position;
			console.log(`A person by the name of ${this.name} now exists.`);
		}

		body_functions(intensity: number): boolean {
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

		print_intention() {
			console.log(`${this.name} wants to ${this.intention}.`);
		}

		decide() {
			if (this.thirst > 50 && this.intention !== actions.drink) {
				console.log(`${this.name} is thirsty.`);
				this.intention = actions.drink;
				return;
			}
			if (this.hunger > 50 && this.intention !== actions.eat) {
				console.log(`${this.name} is hungry.`);
				this.intention = actions.eat;
				return;
			}
			if (this.inventory.length <= 10 && this.intention !== actions.forage) {
				console.log(`${this.name} still has room in their backpack decides to go foraging for food and drink.`);
				this.intention = actions.forage;
				return;
			}
			this.intention = actions.idle;
		}

		pick_up(object: WorldObject) {
			if (object.belongsTo != "") {
				console.log(`${this.name} tried to pick up ${object.name} from ${object.belongsTo}... but decided not to steal.`);
			} else {
				object.belongsTo = this.name;
				this.inventory.push(object);
				world.objects.splice(world.objects.indexOf(object), 1);
				console.log(`${this.name} picked up ${object.name}.`);
			}
		}

		perceive(perception_value: number) {
			console.log(`${this.name} has ${this.inventory.length} items in their backpack.`);
			this.current_perceptions = Array<WorldObject>();
			this.current_perceptions = get_nearby_objects(this.position, perception_value);
		}

		get_status() {
			console.log(`${this.name} is ${this.hunger}% hungry and ${this.thirst}% thirsty.`);
		}

		set_random_current_goal_position(check_if_already_set: boolean) {
			if (check_if_already_set) {
				if (this.position !== this.current_movement_goal) {
					return;
				}
			} 
			console.log(`${this.name} changed their path in order to ${this.intention}`);
			this.current_movement_goal = get_random_position()
		}

		set_current_goal_position(position: position) {
			this.current_movement_goal = position;
		}

		check_if_goal_position_reached(): boolean {
			if (this.position === this.current_movement_goal) {
				console.log(`${this.name} has reached their destination after a long trek and is now resting.`);
				this.intention = actions.idle;
				return true;
			}
			return false;
		}

		move_towards(target: position, speed: number) {
			let distance = Math.sqrt(Math.pow(this.position.x - target.x, 2) + Math.pow(this.position.y - target.y, 2) + Math.pow(this.position.z - target.z, 2));
			let direction = { x: this.position.x - target.x, y: this.position.y - target.y, z: this.position.z - target.z };
			let direction_length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2));
			let direction_unit = { x: direction.x / direction_length, y: direction.y / direction_length, z: direction.z / direction_length };
			if (distance < speed) {
				this.position = target;
			} else {
				let new_position = { x: this.position.x + (direction_unit.x * this.skills.speed), y: this.position.y + (direction_unit.y * this.skills.speed), z: this.position.z + (direction_unit.z * this.skills.speed) };
				this.position = new_position;
			}
		}

		check_for_free_nearby_object(descriptor: object_descriptor[]): WorldObject | undefined {
			return this.current_perceptions.find(x => x.descriptors.find(y => y === descriptor.find(x => x === y)) && x.belongsTo == "");
		}

		do_action(): boolean {
			let action_intensity = 1;
			switch (this.intention) {
				case actions.idle:
					console.log(`${this.name} decides to do nothing in particular for a while.`)
					break;
				case actions.drink:
					let drink = this.inventory.find(x => x.descriptors.find(y => y === object_descriptor.drinkable));
					if (drink) {
						this.thirst -= 60;
						console.log(`${this.name} drinks the ${drink.name}.`);
						this.inventory.splice(this.inventory.findIndex(x => x == drink), 1);
						break;
					} else {

						let nearby_object = this.check_for_free_nearby_object([object_descriptor.drinkable]);
						if (nearby_object) {
							if (is_in_reach(nearby_object.position, this.position, this.skills.reach)) {
								this.pick_up(nearby_object);
								break;
							} else {
								console.log(`${this.name} is walking towards a ${nearby_object.name}`);
								this.move_towards(nearby_object.position, this.skills.speed);
								break;
							}
						} else {
							console.log(`${this.name} is trying to find something to drink.`);
							this.set_random_current_goal_position(this.check_if_goal_position_reached());
							this.move_towards(this.current_movement_goal, this.skills.speed);
							break;
						}
					}
				case actions.eat:
					let food = this.inventory.find(x => x.descriptors.find(y => y === object_descriptor.edible));
					if (food) {
						this.hunger -= 60;
						console.log(`${this.name} eats the ${food.name}.`);
						this.inventory.splice(this.inventory.findIndex(x => x == food), 1);
						break;
					} else {
						let nearby_object = this.check_for_free_nearby_object([object_descriptor.edible]);
						if (nearby_object) {
							if (is_in_reach(nearby_object.position, this.position, this.skills.reach)) {
								this.pick_up(nearby_object);
								break;
							} else {
								console.log(`${this.name} is walking towards a ${nearby_object.name}`);
								this.move_towards(nearby_object.position, this.skills.speed);
								break;
							}
						} else {
							console.log(`${this.name} is trying to find something to eat.`);
							this.set_random_current_goal_position(this.check_if_goal_position_reached());
							this.move_towards(this.current_movement_goal, this.skills.speed);
							break;
						}
					}
					break;
				case actions.walk:
					break;
				case actions.converse:
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
					let nearby_object = this.check_for_free_nearby_object([object_descriptor.edible, object_descriptor.drinkable]);
						if (nearby_object) {
							if (is_in_reach(nearby_object.position, this.position, this.skills.reach)) {
								this.pick_up(nearby_object);
								break;
							} else {
								console.log(`${this.name} is walking towards a ${nearby_object.name}`);
								this.move_towards(nearby_object.position, this.skills.speed);
								break;
							}
						} else {
							console.log(`${this.name} is foraging.`);
							this.set_random_current_goal_position(this.check_if_goal_position_reached());
							this.move_towards(this.current_movement_goal, this.skills.speed);
							break;
						}
					break;
			}

			return this.body_functions(action_intensity);
		}
	}


	class Relationship {
	}

	class WorldObject {
		constructor(name: string, descriptors: object_descriptor[], pos: position, belongsTo: string) {
			this.name = name;
			this.descriptors = descriptors;
			this.position = pos;
			this.belongsTo = belongsTo;
		}
		name: string = "";
		descriptors: object_descriptor[] = [];
		position: position = { x: 1, y: 1, z: 1 };
		belongsTo: string = "";
	}

	class Plant {
		name: string = "";
	}

	class Memory {

	}

	class World {
		name: string;
		width: number = 100;
		height: number = 100;
		z_depth: number = 100;
		people: Person[] = [];
		objects: WorldObject[] = [];
		plants: Plant[] = [];

		constructor(graphics: graphics) {
			this.name = create_name();
			console.log(`Somewhere, a world created itself. It is called ${this.name} by those who inhabit it.`)

			for (let i = 0; i < get_random_whole_number(10, 30); i++) {
				this.people.push(new Person(create_name(), new Date(Date.now()), { x: get_random_whole_number(0, this.width), y: get_random_whole_number(0, this.height), z: 0 }));
			}

			this.simulation_loop();
		}

		simulation_loop() {
			console.log(`Time has started to affect the world.`)
			const sim_timer = timer(1000, 1000).subscribe(() => {

				/**
				 * People actions
				 **/
				this.people.forEach(person => {
					person.perceive(person.skills.perception);
					person.decide();
					if (!person.do_action()) {
						console.log(`${person.name} has been found dead.`);
						this.people.splice(this.people.findIndex(x => x == person), 1);
					}
				});

				/**
				 * World actions
				 **/
				if (this.objects.length < 200) {
					for (let i = 0; i < get_random_whole_number(1, 15); i++) {
						if (decideWithProbability(50)) {
							this.objects.push(new WorldObject(natural_drinks[get_random_whole_number(0, natural_drinks.length)], [object_descriptor.drinkable], { x: get_random_whole_number(0, this.width), y: get_random_whole_number(0, this.height), z: 0 }, ""));
						}
					}
					for (let i = 0; i < get_random_whole_number(1, 15); i++) {
						if (decideWithProbability(50)) {
							this.objects.push(new WorldObject(natural_fruit_forageable[get_random_whole_number(0, natural_fruit_forageable.length)], [object_descriptor.edible], { x: get_random_whole_number(0, this.width), y: get_random_whole_number(0, this.height), z: 0 }, ""));
						}
					}
				} else {
					console.log(`The world is full of objects, ${this.objects.length} in total.`);
				}

				/**
				 * Summary
				 **/
				console.log(`The world has ${this.people.length} people in it.`);
				if (this.people.length === 0) {
					console.log(`The world has no more people in it.`);
					console.log(`The world has ended.`);
					sim_timer.unsubscribe();
					return;
				}

				console.log(`Another hour has passed.`);
			});
		}
	}

	const world = new World(new graphics());
}