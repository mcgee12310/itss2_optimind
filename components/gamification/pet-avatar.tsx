import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pet } from "./types";
import { getPetEmoji } from "./utils";

interface PetAvatarProps {
    pet: Pet;
    cardStyle?: string;
}

export function PetAvatar({ pet, cardStyle = "" }: PetAvatarProps) {
    return (
        <Card className={cardStyle}>
            <CardContent className="pt-6">
                <div className="text-center">
                    <div className="text-7xl mb-4">
                        {getPetEmoji(pet.type)}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">{pet.name}</h2>
                    <Badge variant="outline" className="border-gray-400 text-white">
                        Level {pet.level}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}