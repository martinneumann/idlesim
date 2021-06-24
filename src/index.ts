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

	class Person {
		name: string = "Unnamed Person";
		age: number = 0;
		movement_speed = 1 + (Math.random() * 3);
		position: position = { x: 1, y: 1, z: 1 };
		hunger: number = 100;
		thirst: number = 100;

		relationships: Relationship[] = [];
		inventory: Object[] = [];

		constructor(name: string) {
			this.name = name;
		}

		body_functions(intensity: number) {
			this.hunger - intensity;
			this.thirst - intensity;
		}

		do_action(action: actions) {
			let action_intensity = 1;
			switch (action) {
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

	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
	console.log(create_name());
}