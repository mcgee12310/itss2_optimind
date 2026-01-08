import { Button } from "@/components/ui/button";
import { PetAction } from "./types";

interface PetActionsProps {
    onInteract: (action: PetAction) => void;
}

export function PetActions({ onInteract }: PetActionsProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <Button
                onClick={() => onInteract("feed")}
                variant="secondary"
                className="w-full bg-gray-500/50 hover:bg-gray-500/70 text-white border-gray-400"
            >
                🍖 Cho ăn
            </Button>
            <Button
                onClick={() => onInteract("play")}
                variant="secondary"
                className="w-full bg-gray-500/50 hover:bg-gray-500/70 text-white border-gray-400"
            >
                🎮 Chơi
            </Button>
            <Button
                onClick={() => onInteract("clean")}
                variant="secondary"
                className="w-full bg-gray-500/50 hover:bg-gray-500/70 text-white border-gray-400"
            >
                🧹 Dọn dẹp
            </Button>
        </div>
    );
}
