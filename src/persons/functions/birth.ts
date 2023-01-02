// Fancy name for initialization

import { ObjectDescriptor } from "../../util/objectDescriptor";
import { Need } from "../need";

export const startingNeeds = {
  standard_needs: [
    {
      description: "food",
      recurring: true,
      object_descriptors: [ObjectDescriptor.edible],
    } as Need,
    {
      description: "drink",
      recurring: true,
      object_descriptors: [ObjectDescriptor.drinkable],
    } as Need,
    {
      description: "entertainment",
      recurring: true,
    } as Need,
    {
      description: "safety",
      recurring: true,
    } as Need,
  ],
};
