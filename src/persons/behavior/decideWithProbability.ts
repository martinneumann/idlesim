import { get_random_whole_number } from "../../util/functions/getRandomWholeNumber";

export function decideWithProbability(probability: number): boolean {
    return get_random_whole_number(0, 100) < probability;
}
