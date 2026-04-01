import type { WordStat } from '../api/apiClient';

export function findCutoffIndex(words: WordStat[], threshold: number): number {
    let lowestIndex = 0;
    let highestIndex = words.length;

    while (lowestIndex < highestIndex) {
        const middleIndex = (lowestIndex + highestIndex) >>> 1;

        if (words[middleIndex].count >= threshold) {
            lowestIndex = middleIndex + 1;
        } else {
            highestIndex = middleIndex;
        }
    }

    return lowestIndex;
}
