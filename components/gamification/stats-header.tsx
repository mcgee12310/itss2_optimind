import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pet } from "./types";
import { getExperienceForNextLevel, getExperienceProgress } from "./utils";

interface StatsHeaderProps {
    userCoins: number;
    gamePlays: number;
    pet: Pet | null;
    cardStyle?: string;
}

export function StatsHeader({ userCoins, gamePlays, pet, cardStyle = "" }: StatsHeaderProps) {
    const level = pet?.level || 1;
    const experience = pet?.experience || 0;
    const nextLevelExp = getExperienceForNextLevel(level);
    const progressValue = getExperienceProgress(experience, level);

    return (
        <Card className={cardStyle}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-300">Xu của bạn</p>
                        <p className="text-3xl font-bold text-white">{userCoins} 💰</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-300">Lượt chơi game</p>
                        <p className="text-3xl font-bold text-white">{gamePlays} 🎮</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-300">Cấp độ thú cưng</p>
                        <p className="text-3xl font-bold text-white">{level} ⭐</p>
                        <div className="mt-2">
                            <p className="text-xs text-gray-300">Kinh nghiệm</p>
                            <Progress value={progressValue} className="w-full bg-gray-500" />
                            <p className="text-xs text-gray-300 mt-1">
                                {experience} / {nextLevelExp}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
