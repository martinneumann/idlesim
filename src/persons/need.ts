import { object_descriptor } from "../util/objectDescriptor";

/**
 * Any need a person might have and can communicate.
 * * hunger (-> get food), thirst (-> get drink), energy (-> get bed)
 * * safety (-> defend over time/kill enemy)
 * * happiness (-> get song performed/get item that increases happiness)
 * *
 */
export class Need {
  description:
    | "food"
    | "drink"
    | "energy"
    | "safety"
    | "entertainment"
    | "unspecified" = "unspecified";

  // Value is either necessity or preference of provision by offering party
  value = 0;
  object_descriptors: object_descriptor[] = [];
  recurring = true;
}
