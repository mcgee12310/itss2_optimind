// Type definitions for gamification features

export interface Pet {
    id: string;
    name: string;
    level: number;
    experience: number;
    hunger: number;
    happiness: number;
    energy: number;
    type: string;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: string;
    data?: string;
}

export interface InventoryItem {
    id: string;
    itemId: string;
    item: ShopItem;
    quantity: number;
}

export interface PetStat {
    label: string;
    value: number;
    icon: string;
}

export type PetAction = "feed" | "play" | "clean";