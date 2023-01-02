/**
 * Any need a person might have and can communicate.
 * * hunger (-> get food), thirst (-> get drink), energy (-> get bed)
 * * safety (-> defend over time/kill enemy)
 * * happiness (-> get song performed/get item that increases happiness)
 * *
 */
export type Need = {
  description:
    | "food"
    | "drink"
    | "energy"
    | "safety"
    | "entertainment"
    | undefined;
  recurring: boolean;
};
