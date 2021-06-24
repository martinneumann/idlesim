import { timer } from 'rxjs';
var sim;
(function (sim) {
    let actions;
    (function (actions) {
        actions[actions["idle"] = 1] = "idle";
        actions[actions["walk"] = 2] = "walk";
        actions[actions["eat"] = 3] = "eat";
        actions[actions["converse"] = 4] = "converse";
        actions[actions["drink"] = 5] = "drink";
        actions[actions["pick_up"] = 6] = "pick_up";
        actions[actions["fell"] = 7] = "fell";
        actions[actions["build"] = 8] = "build";
        actions[actions["marry"] = 9] = "marry";
        actions[actions["bear_child"] = 10] = "bear_child";
        actions[actions["sleep"] = 11] = "sleep";
        actions[actions["search"] = 12] = "search";
    })(actions || (actions = {}));
    let object_descriptor;
    (function (object_descriptor) {
        object_descriptor[object_descriptor["edible"] = 1] = "edible";
        object_descriptor[object_descriptor["drinkable"] = 2] = "drinkable";
        object_descriptor[object_descriptor["poisoned"] = 3] = "poisoned";
        object_descriptor[object_descriptor["weapon"] = 4] = "weapon";
        object_descriptor[object_descriptor["building_material"] = 5] = "building_material";
    })(object_descriptor || (object_descriptor = {}));
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function create_name() {
        let vowels = 'aeiouäöüeë';
        let consonants = 'bcdfghjklmnpqrstvwxyz';
        let first_name = "";
        let last_name = "";
        for (let i = 0; i < (Math.floor(Math.random() * 10) + 6); i++) {
            if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
                first_name += vowels[Math.floor(Math.random() * vowels.length)];
            }
            else {
                first_name += consonants[Math.floor(Math.random() * consonants.length)];
            }
        }
        for (let i = 0; i < (Math.floor(Math.random() * 15) + 6); i++) {
            if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
                last_name += vowels[Math.floor(Math.random() * vowels.length)];
            }
            else {
                last_name += consonants[Math.floor(Math.random() * consonants.length)];
            }
        }
        first_name = capitalizeFirstLetter(first_name);
        last_name = capitalizeFirstLetter(last_name);
        return first_name + " " + last_name;
    }
    function get_random_whole_number(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    class Person {
        constructor(name, birthday, position) {
            this.name = "Unnamed Person";
            this.age = 0;
            this.movement_speed = 1 + (Math.random() * 3);
            this.position = { x: 1, y: 1, z: 1 };
            this.hunger = 100;
            this.thirst = 100;
            this.relationships = [];
            this.inventory = [];
            this.memory = [];
            this.current_perceptions = [];
            this.intention = actions.idle;
            this.current_action = actions.idle;
            this.name = name;
            this.birthday = birthday;
            this.position = position;
            console.log(`A person by the name of ${this.name} now exists.`);
        }
        body_functions(intensity) {
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
        perceive(objects, people, plants) {
            this.current_perceptions.push(objects, people, plants);
        }
        do_action() {
            let action_intensity = 1;
            switch (this.intention) {
                case actions.idle:
                    console.log(`${this.name} decides to do nothing in particular for a bit.`);
                    break;
                case actions.drink:
                    let drink = this.inventory.find(x => x.descriptors.find(y => y === object_descriptor.drinkable));
                    if (drink) {
                        this.body_functions(-30);
                        action_intensity = 0;
                        console.log(`${name} drinks the ${drink.name}.`);
                        this.inventory.splice(this.inventory.findIndex(x => x == drink), 1);
                    }
                    else {
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
    class WorldObject {
        constructor() {
            this.name = "";
            this.descriptors = [];
            this.position = { x: 1, y: 1, z: 1 };
        }
    }
    class Plant {
        constructor() {
            this.name = "";
        }
    }
    class Memory {
    }
    class World {
        constructor() {
            this.people = [];
            this.objects = [];
            this.plants = [];
            this.name = create_name();
            console.log(`Somehow, somewhere, a world created itself. It is called ${this.name} by those who inhabit it.`);
            for (let i = 0; i < get_random_whole_number(10, 30); i++) {
                this.people.push(new Person(create_name(), new Date(Date.now()), { x: 1, y: 1, z: 1 }));
            }
            this.simulation_loop();
        }
        simulation_loop() {
            console.log(`Time has started to affect the world.`);
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
})(sim || (sim = {}));
