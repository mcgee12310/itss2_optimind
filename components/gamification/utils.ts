// Utility functions for gamification features

/**
 * Get the emoji icon for a pet type
 */
export function getPetEmoji(petType: string): string {
    switch (petType) {
        case 'dog': return '🐕';
        case 'cat': return '🐱';
        case 'bird': return '🐦';
        case 'rabbit': return '🐰';
        case 'dragon': return '🐉';
        case 'unicorn': return '🦄';
        default: return '🐾';
    }
}

/**
 * Get the emoji icon for an item type
 */
export function getItemIcon(itemType: string): string {
    switch (itemType) {
        case 'pet': return '🐾';
        case 'game_play': return '🎮';
        case 'food': return '🍎';
        case 'toy': return '🧸';
        case 'decoration': return '🏠';
        case 'background': return '🌄';
        default: return '📦';
    }
}

/**
 * Calculate experience needed for next level
 */
export function getExperienceForNextLevel(level: number): number {
    return level * 10;
}

/**
 * Calculate experience progress percentage
 */
export function getExperienceProgress(currentExp: number, level: number): number {
    const nextLevelExp = getExperienceForNextLevel(level);
    return (currentExp / nextLevelExp) * 100;
}
