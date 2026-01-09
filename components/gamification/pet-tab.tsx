import { Pet, PetAction, PetStat } from "./types";
import { PetAvatar } from "./pet-avatar";
import { PetStats } from "./pet-stats";
import { PetActions } from "./pet-actions";

interface PetTabProps {
    pet: Pet | null;
    onInteract: (action: PetAction) => void;
    cardStyle?: string;
}

export function PetTab({ pet, onInteract, cardStyle = "" }: PetTabProps) {
    if (!pet) {
        return null;
    }

    const petStats: PetStat[] = [
        { label: "Đói", value: pet.hunger || 0, icon: "🍖" },
        { label: "Vui", value: pet.happiness || 0, icon: "😊" },
        { label: "Năng Lượng", value: pet.energy || 0, icon: "⚡" },
    ];

    return (
        <div className="space-y-4">
            <PetAvatar pet={pet} cardStyle={cardStyle} />
            <PetStats stats={petStats} cardStyle={cardStyle} />
            <PetActions onInteract={onInteract} />
        </div>
    );
}