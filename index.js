var sim;
(function (sim) {
    var actions;
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
    })(actions || (actions = {}));
    var object_descriptor;
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
        var vowels = 'aeiouäöüeë';
        var consonants = 'bcdfghjklmnpqrstvwxyz';
        var first_name = "";
        var last_name = "";
        for (var i = 0; i < (Math.floor(Math.random() * 10) + 6); i++) {
            if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
                first_name += vowels[Math.floor(Math.random() * vowels.length)];
            }
            else {
                first_name += consonants[Math.floor(Math.random() * consonants.length)];
            }
        }
        for (var i = 0; i < (Math.floor(Math.random() * 15) + 6); i++) {
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
    var Person = /** @class */ (function () {
        function Person(name, birthday) {
            this.name = "Unnamed Person";
            this.age = 0;
            this.movement_speed = 1 + (Math.random() * 3);
            this.position = { x: 1, y: 1, z: 1 };
            this.hunger = 100;
            this.thirst = 100;
            this.relationships = [];
            this.inventory = [];
            this.memory = [];
            this.current_action = actions.idle;
            this.name = name;
            this.birthday = birthday;
            console.log("A person by the name of " + this.name + " now exists.");
        }
        Person.prototype.body_functions = function (intensity) {
            this.hunger - intensity;
            this.thirst - intensity;
        };
        Person.prototype.do_action = function (action) {
            var action_intensity = 1;
            switch (action) {
                case actions.idle:
                    console.log(this.name + " decides to do nothing in particular for a bit.");
                    break;
                case actions.drink:
                    var drink_1 = this.inventory.find(function (x) { return x.descriptors.find(function (y) { return y === object_descriptor.drinkable; }); });
                    if (drink_1) {
                        this.body_functions(-30);
                        action_intensity = 0;
                        console.log(name + " drinks the " + drink_1.name + ".");
                        this.inventory.splice(this.inventory.findIndex(function (x) { return x == drink_1; }), 1);
                    }
                    else {
                        console.log(this.name + " tried to drink, but cannot find anything drinkable.");
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
        };
        return Person;
    }());
    var Relationship = /** @class */ (function () {
        function Relationship() {
        }
        return Relationship;
    }());
    var Object = /** @class */ (function () {
        function Object() {
            this.descriptors = [];
            this.position = { x: 1, y: 1, z: 1 };
        }
        return Object;
    }());
    var Plant = /** @class */ (function () {
        function Plant() {
        }
        return Plant;
    }());
    var Memory = /** @class */ (function () {
        function Memory() {
        }
        return Memory;
    }());
    var World = /** @class */ (function () {
        function World() {
            this.people = [];
            this.objects = [];
            this.plants = [];
            this.name = create_name();
            console.log("Somehow, somewhere, a world created itself. It is called " + this.name + " by those who inhabit it.");
            for (var i = 0; i < get_random_whole_number(10, 30); i++) {
                this.people.push(new Person(create_name(), new Date(Date.now())));
            }
        }
        return World;
    }());
    var world = new World();
})(sim || (sim = {}));
