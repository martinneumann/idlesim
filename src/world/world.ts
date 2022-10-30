import p5 from "p5";
import { timer } from "rxjs";
import { natural_drinks, natural_fruit_forageable } from "../assets/environment";
import { Plant } from "../assets/plant";
import { check_if_boundaries_are_reached } from "../geometry/functions/checkIfBoundariesAreReached";
import MyCircle from "../graphics";
import { WorldObject } from "../objects/worldObjects";
import { decideWithProbability } from "../persons/behavior/decideWithProbability";
import { get_nearby_people } from "../persons/behavior/getNearbyPeople";
import { Person } from "../persons/person";
import { get_random_whole_number } from "../util/functions/getRandomWholeNumber";
import { createName } from "../util/nameCreators";
import { object_descriptor } from "../util/objectDescriptor";
import { text } from "../util/text";
import { get_color_by_object_type } from "../util/utils";

export
    class World {
    name: string;
    width: number = 700.0;
    height: number = 700.0;
    z_depth: number = 100.0;
    people: Person[] = [];
    objects: WorldObject[] = [];
    texts: text[] = [];
    plants: Plant[] = [];
    p5: p5;

    constructor() {
        this.name = createName();

        console.log(`Somewhere, a world created itself. It is called ${this.name} by those who inhabit it.`)

        for (let i = 0; i < get_random_whole_number(10, 10); i++) {
            this.people.push(new Person(createName(), new Date(Date.now()), { x: get_random_whole_number(0, this.width), y: get_random_whole_number(0, this.height), z: 0 }, this));
        }

        this.p5 = new p5(this.sketch);

        this.simulation_loop();
    }

    sketch = (p5: p5) => {
        console.log("Setting up graphics");

        // The sketch setup method 
        p5.setup = () => {
            console.log('setup');
            // Creating and positioning the canvas
            const canvas = p5.createCanvas(800, 800);
            canvas.parent("app");

            // Configuring the canvas
            p5.background("black");

        };

        p5.mouseClicked = () => {
            console.log(`Mouse clicked at ${p5.mouseX}, ${this.p5.mouseY}`);

            // Get nearest person
            get_nearby_people({ x: p5.mouseX, y: this.p5.mouseY, z: 0 }, 105, this).forEach(x => {
                console.log(`${x.name} is nearby.`);

                // Draw stats and intention next to person as text
                this.texts.push(new text(x.name, x.position.x + 10, x.position.y + 10));
                this.texts.push(new text(`Intention: ${x.intention}`, x.position.x + 10, x.position.y + 20));
                this.texts.push(new text(`Inventory: ${x.inventory.length}`, x.position.x + 10, x.position.y + 30));
            }
            );
        }

        p5.mouseWheel = (event) => {
            console.log(`Mouse wheel at ${p5.mouseX}, ${this.p5.mouseY} with event ${JSON.stringify(event)}`);
            if (event !== undefined) {
            }
        }
    }

    graphics_loop() {
        this.p5.clear();
        const people_circles: MyCircle[] = [];

        // People
        this.people.forEach(person => {
            people_circles.push(new MyCircle(this.p5, this.p5.createVector(person.position.x, person.position.y, person.position.z), 5, [255, 100, 0], person.name));
            people_circles.push(new MyCircle(this.p5, this.p5.createVector(person.position.x, person.position.y, person.position.z), person.skills.perception * 2, [100, 100, 100], undefined, 100));

        });

        // Objects
        const object_circles: MyCircle[] = [];
        this.objects.forEach(object => {
            object_circles.push(new MyCircle(this.p5, this.p5.createVector(object.position.x, object.position.y, object.position.z), 3, get_color_by_object_type(object.descriptors[0]), object.name));
        });


        // Text
        this.texts.forEach(_text => {
            this.p5.text(_text.text, _text.x, _text.y);
        });

        // Draw
        this.p5.draw = () => {

            people_circles.forEach(circle => circle.draw());
            object_circles.forEach(circle => circle.draw());
            // Draw lines around the world width and height
            this.p5.stroke(255, 255, 255);
            this.p5.line(0, 0, this.width, 0);
            this.p5.line(0, 0, 0, this.height);
            this.p5.line(this.width, 0, this.width, this.height);
            this.p5.line(0, this.height, this.width, this.height);

        };
    }

    simulation_loop() {
        console.log(`Time has started to affect the world.`)
        const sim_timer = timer(1000, 200).subscribe(() => {

            /**
             * People actions
             **/

            this.people.forEach(person => {
                check_if_boundaries_are_reached(person.position, this);
                if (person.check_if_goal_position_reached()) {
                    person.set_random_current_goal_position(true);
                }
                person.perceive(person.skills.perception);
                person.organize();
                person.decide();
                if (!person.do_action()) {
                    console.log(`${person.name} has been found dead.`);
                    this.people.splice(this.people.findIndex(x => x == person), 1);
                }
            });

            /**
             * World actions
             **/
            if (this.objects.length < 10) {
                for (let i = 0; i < get_random_whole_number(1, 15); i++) {
                    if (decideWithProbability(50)) {
                        this.objects.push(new WorldObject(natural_drinks[get_random_whole_number(0, natural_drinks.length)], [object_descriptor.drinkable], { x: get_random_whole_number(150, this.width), y: get_random_whole_number(150, this.height), z: 1 }, ""));
                    }
                }
                for (let i = 0; i < get_random_whole_number(1, 15); i++) {
                    if (decideWithProbability(50)) {
                        this.objects.push(new WorldObject(natural_fruit_forageable[get_random_whole_number(0, natural_fruit_forageable.length)], [object_descriptor.edible], { x: get_random_whole_number(150, this.width), y: get_random_whole_number(150, this.height), z: 1 }, ""));
                    }
                }
            }

            /**
             * Graphics
             */
            this.graphics_loop();

            /**
             * Summary
             **/
            if (this.people.length === 0) {
                console.log(`The world has no more people in it.`);
                console.log(`The world has ended.`);
                sim_timer.unsubscribe();
            }

        });
    }
}