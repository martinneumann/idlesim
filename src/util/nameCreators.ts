export function create_name(): string {
    let vowels = 'aeiou';
    let consonants = 'bcdfghjklmnpqrstvwxyz';
    let first_name = ""
    let last_name = "";
    let vowel_chance = 1;
    for (let i = 0; i < (Math.floor(Math.random() * 10) + 3); i++) {
        if ((Math.floor(Math.random() * 3) + vowel_chance) > 2) {
            first_name += vowels[Math.floor(Math.random() * vowels.length)]
            vowel_chance = 0;
        } else {
            first_name += consonants[Math.floor(Math.random() * consonants.length)]
            vowel_chance += 2;
        }
    }

    for (let i = 0; i < (Math.floor(Math.random() * 15) + 4); i++) {
        if ((Math.floor(Math.random() * 2) + 1) % 2 === 0) {
            last_name += vowels[Math.floor(Math.random() * vowels.length)]
        } else {
            last_name += consonants[Math.floor(Math.random() * consonants.length)]
        }
    }
    first_name = capitalizeFirstLetter(first_name)
    last_name = capitalizeFirstLetter(last_name)
    return first_name + " " + last_name
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}