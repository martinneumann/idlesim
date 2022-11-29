import { Need } from "./need";

export class Job {
  fulfilled_needs: Need[] = [];
  title: "orchardist" | "water carrier" | "bard" | "hunter" | "peasant" =
    "peasant";
}
