export function get_random_whole_number(min: number, max: number) {
    let returnval = Math.floor(Math.random() * (max - min)) + min;
    return returnval
}

