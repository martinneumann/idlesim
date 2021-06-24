import { timer } from 'rxjs';
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
	}

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

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function create_name(): string {
		let vowels = 'aeiouäöüeë';
		let consonants = 'bcdfghjklmnpqrstvwxyz';
		let first_name = ""
		let last_name = "";
		for (let i = 0; i < (Math.floor(Math.random() * 10) + 6); i++) {
			if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
				first_name += vowels[Math.floor(Math.random() * vowels.length)]
			} else {
				first_name += consonants[Math.floor(Math.random() * consonants.length)]
			}
		}

		for (let i = 0; i < (Math.floor(Math.random() * 15) + 6); i++) {
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

	function get_random_whole_number(min: number, max: number) {
		return Math.floor(Math.random() * (max - min)) + min
	}

	class Person {
		name: string = "Unnamed Person";
		age: number = 0;
		movement_speed = 1 + (Math.random() * 3);
		position: position = { x: 1, y: 1, z: 1 };
		hunger: number = 100;
		thirst: number = 100;

		birthday: Date;

		relationships: Relationship[] = [];
		inventory: Object[] = [];
		memory: Memory[] = [];

		current_perceptions: any[] = [];
		intention: actions = actions.idle;
		current_action: actions = actions.idle;

		constructor(name: string, birthday: Date, position: position) {
			this.name = name;
			this.birthday = birthday;
			this.position = position;
			console.log(`A person by the name of ${this.name} now exists.`);
		}

		body_functions(intensity: number) {
			this.hunger - intensity;
			this.thirst - intensity;
		}

		decide() {
			if (this.thirst < 50) {
				console.log(`${this.name} is hungry.`);
				this.intention = actions.eat;
				return;
			}
			if (this.hunger < 50) {
				console.log(`${this.name} is hungry.`);
				this.intention = actions.eat;
				return;
			}
			
		}

		perceive(objects: object[], people: Person[], plants: Plant[]) {
			this.current_perceptions.push(objects, people, plants);
		}

		do_action() {
			let action_intensity = 1;
			switch (this.intention) {
				case actions.idle:
					console.log(`${this.name} decides to do nothing in particular for a bit.`)
					break;
				case actions.drink:
					let drink = this.inventory.find(x => x.descriptors.find(y => y === object_descriptor.drinkable));
					if (drink) {
						this.body_functions(-30);
						action_intensity = 0;
						console.log(`${name} drinks the ${drink.name}.`);
						this.inventory.splice(this.inventory.findIndex(x => x == drink), 1);
					} else {
						console.log(`${this.name} tried to drink, but cannot find anything drinkable.`);
					}
					break;
				case actions.eat:
					action_intensity = 0;
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
			}

			this.body_functions(action_intensity);
		}
	}


	class Relationship {
	}

	class Object {
		name: string;
		descriptors: object_descriptor[] = [];
		position: position = { x: 1, y: 1, z: 1 };
	}

	class Plant {
		name: string;
	}

	class Memory {

	}

	class World {
		name: string;
		people: Person[] = [];
		objects: Object[] = [];
		plants: Plant[] = [];

		constructor() {
			this.name = create_name();
			console.log(`Somehow, somewhere, a world created itself. It is called ${this.name} by those who inhabit it.`)
			for (let i = 0; i < get_random_whole_number(10, 30); i++) {
				this.people.push(new Person(create_name(), new Date(Date.now()), {x: 1, y: 1, z: 1}));
			}

			this.simulation_loop();
		}

		simulation_loop() {
			timer(10000, 10000).subscribe(() => {
				this.people.forEach(person => {
					person.perceive(this.objects, this.people, this.plants);
					person.decide();
					person.do_action();
				});
				console.log(`Another hour has passed.`);
			});
		}
	}	

	const world = new World();
}