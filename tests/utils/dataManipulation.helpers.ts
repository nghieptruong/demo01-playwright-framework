import { faker } from "@faker-js/faker";

// Generic data manipulation functions for randomness
export function pickRandomNumberBetween(min: number, max: number) {
    return faker.number.int({ min: min, max: max });
}

export function shuffleItems<T>(arr: T[]): T[] {
    if (arr.length === 0) {
        console.warn('Array is empty, nothing to shuffle');
        return [];
    }
    return arr.sort(() => Math.random() - 0.5);
}

export function pickRandomItem<T>(arr: T[]): T {

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];

}

export function pickSampleItems<T>(allItems: T[]): T[] {           // first, last, random middle
    const count = allItems.length;

    if (count === 0) throw new Error('No items to pick sample from');

    if (count <= 2) return allItems;

    const randomIndex = Math.floor(Math.random() * (count - 2)) + 1;

    const samples: T[] = [
        allItems[0],
        allItems[count - 1],
        allItems[randomIndex],
    ];

    return shuffleItems(samples);
}

// Indexes manipulation functions

function generateIndexes(count: number, startFrom: number = 0): number[] {
    return Array.from({ length: count }, (_, i) => i + startFrom);
}

export function pickSampleIndexes(count: number): number[] {   // aim for up to 3

    if (count === 0) throw new Error('No items to pick sample from');

    const indexes = generateIndexes(count);

    if (count <= 2) {
        return indexes;
    }

    return pickSampleItems(shuffleItems(indexes));
}

export function shuffleIndexesFromOne(count: number): number[] {

    if (count === 0) {
        console.warn('No applicable index to shuffle');
        return [];
    }

    return shuffleItems(generateIndexes(count, 1));
}

export function shuffleIndexes(count: number): number[] {
    if (count === 0) {
        console.warn('No applicable index to shuffle');
        return [];
    }
    return shuffleItems(generateIndexes(count));
}


// Content extraction functions
export function extractShowtimeId(href: string) {
    const id = href.split('/purchase/').pop();

    if (!id) throw new Error(`Invalid showtime href: ${href}`);

    return id;
}
