const vowels = [
    'a', 'e', 'i', 'o', 'u'
]

const consonants_start = [
    'ch', 'b', 'c', 'd', 'f', 't', 'sh', 'z', 'w', 'g', 'k', 'l', 'h'
]

const consonants_middle = [
    'ch', 'b', 'c', 'd', 'f', 't', 'sh', 'z', 'w', 'g', 'k', 'l'
]

const special_characters = [
    '\'', '-'
]

function selectNamePart(count: number) {
    if (count % 2) {
        return vowels[Math.floor(Math.random() * vowels.length)]
    } else {
        return consonants_start[Math.floor(Math.random() * consonants_start.length)]
    }
}

export function createName(): string {
    let first_name = ""
    let last_name = "";
    const numberOfFirstNameLetters = Math.floor((Math.random() + 2) * 3)
    const numberOfLastNameLetters = Math.floor((Math.random() + 2) * 4)
    for (let i = 0; i < numberOfFirstNameLetters; i++) {
        first_name += selectNamePart(i);
    }

    for (let i = 0; i < numberOfLastNameLetters; i++) {
        last_name += selectNamePart(i);
    }
    first_name = capitalizeFirstLetter(first_name)
    last_name = capitalizeFirstLetter(last_name)
    return first_name + " " + last_name
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}