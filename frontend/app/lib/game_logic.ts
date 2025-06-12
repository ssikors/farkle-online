export function isScorableSelection(dice: number[]): boolean {
    const countMap = new Map<number, number>();
    dice.forEach(d => countMap.set(d, (countMap.get(d) || 0) + 1));

    let remaining = [...dice]; // Will remove scorable dice from this

    // Check for six-dice straight
    if (dice.length === 6 && new Set(dice).size === 6) {
        return true;
    }

    // Check five-dice straights
    const sorted = [...new Set(dice)].sort((a, b) => a - b);
    if (dice.length === 5 && (
        JSON.stringify(sorted) === JSON.stringify([1,2,3,4,5]) ||
        JSON.stringify(sorted) === JSON.stringify([2,3,4,5,6])
    )) {
        return true;
    }

    // Check for three+ of a kind
    for (const [value, count] of countMap.entries()) {
        if (count >= 3) {
            const used = count >= 5 ? 5 : count; // Up to 5-of-a-kind handled
            remaining = removeN(remaining, value, used);
        }
    }

    // Remove single 1s and 5s (they are also scorable)
    remaining = remaining.filter(v => !(v === 1 || v === 5));

    return remaining.length === 0;
}

// Helper to remove N occurrences of a value from a list
function removeN(arr: number[], value: number, n: number): number[] {
    let removed = 0;
    return arr.filter(v => {
        if (v === value && removed < n) {
            removed++;
            return false;
        }
        return true;
    });
}

export function hasScorableSubset(dice: number[]): boolean {
    const countMap = new Map<number, number>();
    dice.forEach(d => countMap.set(d, (countMap.get(d) || 0) + 1));

    // Six-dice straight
    if (dice.length >= 6 && new Set(dice).size === 6) {
        return true;
    }

    // Five-dice straight
    const sortedUnique = [...new Set(dice)].sort((a, b) => a - b);
    const isStraight = (target: number[]) =>
        target.every((val, i) => sortedUnique[i] === val);
    if (
        sortedUnique.length >= 5 &&
        (isStraight([1, 2, 3, 4, 5]) || isStraight([2, 3, 4, 5, 6]))
    ) {
        return true;
    }

    // Three or more of a kind
    for (const [val, count] of countMap.entries()) {
        if (count >= 3) {
            return true;
        }
    }

    // Individual 1s or 5s
    if (countMap.get(1) || countMap.get(5)) {
        return true;
    }

    return false;
}
