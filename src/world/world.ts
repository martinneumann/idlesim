import p5 from "p5";
import { timer } from "rxjs";
import {
  natural_drinks,
  natural_fruit_forageable,
} from "../assets/environment";
import { Plant } from "../assets/plant";
import { check_if_boundaries_are_reached } from "../geometry/functions/checkIfBoundariesAreReached";
import MyCircle from "../graphics";
import { Tree, WorldObject } from "../objects/worldObjects";
import { decideWithProbability } from "../persons/behavior/decideWithProbability";
import { get_nearby_people } from "../persons/behavior/getNearbyPeople";
import { Person } from "../persons/person";
import { actions } from "../util/actions";
import { get_random_whole_number } from "../util/functions/getRandomWholeNumber";
import { createName } from "../util/nameCreators";
import { object_descriptor } from "../util/objectDescriptor";
import { text } from "../util/text";
import { get_color_by_object_type } from "../util/utils";

export class World {
  name: string;
  width: number = 700.0;
  height: number = 700.0;
  z_depth: number = 100.0;
  people: Person[] = [];
  objects: (WorldObject | Tree)[] = [];
  texts: text[] = [];
  plants: Plant[] = [];
  p5: p5;

  constructor() {
    this.name = createName();

    console.log(
      `Somewhere, a world created itself. It is called ${this.name} by those who inhabit it.`
    );

    this.generate_river();
    this.generate_fruit_tree();
    this.generate_fruit_tree();
    this.generate_fruit_tree();
    this.generate_fruit_tree();

    for (let i = 0; i < get_random_whole_number(10, 10); i++) {
      this.people.push(
        new Person(
          createName(),
          new Date(Date.now()),
          {
            x: get_random_whole_number(0, this.width),
            y: get_random_whole_number(0, this.height),
            z: 0,
          },
          this
        )
      );
    }

    this.p5 = new p5(this.sketch);
  }

  sketch = (p5: p5) => {
    // The sketch setup method
    p5.setup = () => {
      // Creating and positioning the canvas
      const canvas = p5.createCanvas(800, 800);
      canvas.parent("app");

      // Configuring the canvas
      p5.background("black");
    };

    p5.mouseClicked = () => {
      // Get nearest person
      get_nearby_people(
        { x: p5.mouseX, y: this.p5.mouseY, z: 0 },
        105,
        this
      ).forEach((x) => {
        // Draw stats and intention next to person as text
        this.texts.push(new text(x.name, x.position.x + 10, x.position.y + 10));
        this.texts.push(
          new text(
            `Intention: ${x.intention}`,
            x.position.x + 10,
            x.position.y + 20
          )
        );
        this.texts.push(
          new text(
            `Inventory: ${x.inventory.length}`,
            x.position.x + 10,
            x.position.y + 30
          )
        );
      });
    };

    p5.mouseWheel = (event) => {
      if (event !== undefined) {
      }
    };
  };

  graphics_loop() {
    this.p5.clear();
    const people_circles: MyCircle[] = [];

    // People
    this.people.forEach((person) => {
      people_circles.push(
        new MyCircle(
          this.p5,
          this.p5.createVector(
            person.position.x,
            person.position.y,
            person.position.z
          ),
          5,
          [255, 100, 0],
          person.name
        )
      );
      people_circles.push(
        new MyCircle(
          this.p5,
          this.p5.createVector(
            person.position.x,
            person.position.y,
            person.position.z
          ),
          person.skills.perception * 2,
          [100, 100, 100],
          undefined,
          100
        )
      );
    });

    // Objects
    const object_circles: MyCircle[] = [];
    this.objects.forEach((object) => {
      object_circles.push(
        new MyCircle(
          this.p5,
          this.p5.createVector(
            object.position.x,
            object.position.y,
            object.position.z
          ),
          3,
          get_color_by_object_type(object.descriptors[0]),
          object.name
        )
      );
    });

    // Text
    this.texts.forEach((_text) => {
      this.p5.text(_text.text, _text.x, _text.y);
    });

    // Draw
    this.p5.draw = () => {
      people_circles.forEach((circle) => circle.draw());
      object_circles.forEach((circle) => circle.draw());
      // Draw lines around the world width and height
      this.p5.stroke(255, 255, 255);
      this.p5.line(0, 0, this.width, 0);
      this.p5.line(0, 0, 0, this.height);
      this.p5.line(this.width, 0, this.width, this.height);
      this.p5.line(0, this.height, this.width, this.height);
    };
  }

  generate_fruit_tree() {
    let source = {
      x: get_random_whole_number(150, this.width),
      y: get_random_whole_number(150, this.height),
    };

    let fruit_type =
      Math.random() > 0.5 ? object_descriptor.apple : object_descriptor.pear;

    this.objects.push(
      new Tree(
        natural_fruit_forageable[
          Math.floor(Math.random() * natural_fruit_forageable.length)
        ] + " tree",
        [object_descriptor.fruit_tree, fruit_type],
        {
          x: source.x,
          y: source.y,
          z: 1,
        },
        "",
        30
      )
    );
  }

  generate_river() {
    let source = {
      x: get_random_whole_number(150, this.width),
      y: get_random_whole_number(150, this.height),
    };

    let bias = Math.random() > 0.5 ? -1 : 1;

    for (let a = 0; a <= 100; a++) {
      this.objects.push(
        new WorldObject(
          "river water",
          [object_descriptor.drinkable, object_descriptor.regenerative],
          {
            x: source.x,
            y: source.y,
            z: 1,
          },
          ""
        )
      );

      source.x += get_random_whole_number(bias * 2, bias * 10);
      source.y += get_random_whole_number(bias * 2, bias * 10);
    }
  }

  simulation_loop() {
    console.log(`Time has started to affect the world.`);

    const html = document.getElementById("table-body") as HTMLElement;

    let a = 0;
    const sim_timer = timer(1000, 200).subscribe(() => {
      a += 1;
      if (html.innerHTML !== null) html.innerHTML = "";

      /**
       * People actions
       **/
      this.people.forEach((person) => {
        check_if_boundaries_are_reached(person.position, this);
        if (person.check_if_goal_position_reached()) {
          person.set_random_current_goal_position(true);
        }
        person.perceive(person.skills.perception);
        person.organize();
        person.decide();
        if (!person.do_action()) {
          console.log(`${person.name} has been found dead.`);
          this.people.splice(
            this.people.findIndex((x) => x == person),
            1
          );
        }
      });

      /**
       * Stat update
       */

      if (html?.innerHTML !== null) {
        this.people.forEach((person) => {
          html.innerHTML += `<tr><td>${person.name}</td>
            </td>
            <td>${actions[person.intention]}
            </td>
          <td>${actions[person.current_action]}</td>
          <td>${JSON.stringify(
            person.inventory
              .map((item) => item.name)
              .reduce(
                (cnt: any, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt),
                {}
              )
          )
            .replace(/"/g, "")
            .replace(/{/g, "")
            .replace(/}/g, "")}
            </td>
          <td>${person.inventory.filter((x) => x.markedForTrade).length}
            </td>
            <td>${person.hunger}
            </td>
            <td>${person.thirst}
            </td>
            <td>${person.trade_timeout}
            </td>
            <tr>`;
        });
      }

      /**
       * World actions
       **/

      // Fruit
      this.objects
        .filter((x) => x instanceof Tree)
        .forEach((tree: any) => {
          if (tree.timeToHarvest >= 0) {
            tree.timeToHarvest--;
          } else {
            let fruit_quantity = get_random_whole_number(0, 3);
            for (let a = 0; a < fruit_quantity; a++) {
              this.objects.push(
                new WorldObject(
                  object_descriptor[tree.descriptors[1].valueOf()],
                  [object_descriptor.edible],
                  {
                    x: get_random_whole_number(
                      tree.position.x - 15,
                      tree.position.x + 15
                    ),
                    y: get_random_whole_number(
                      tree.position.y - 15,
                      tree.position.y + 15
                    ),
                    z: 1,
                  },
                  ""
                )
              );
            }

            tree.timeToHarvest = 30;
          }
        });
      if (this.objects.length < 10) {
        for (let i = 0; i < get_random_whole_number(1, 15); i++) {
          if (decideWithProbability(50)) {
            this.objects.push(
              new WorldObject(
                natural_drinks[
                  get_random_whole_number(0, natural_drinks.length)
                ],
                [object_descriptor.drinkable],
                {
                  x: get_random_whole_number(150, this.width),
                  y: get_random_whole_number(150, this.height),
                  z: 1,
                },
                ""
              )
            );
          }
        }
        for (let i = 0; i < get_random_whole_number(1, 15); i++) {
          if (decideWithProbability(50)) {
            this.objects.push(
              new WorldObject(
                natural_fruit_forageable[
                  get_random_whole_number(0, natural_fruit_forageable.length)
                ],
                [object_descriptor.edible],
                {
                  x: get_random_whole_number(150, this.width),
                  y: get_random_whole_number(150, this.height),
                  z: 1,
                },
                ""
              )
            );
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
