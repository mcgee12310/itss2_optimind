import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PetStat } from "./types";

interface PetStatsProps {
    stats: PetStat[];
    cardStyle?: string;
}

export function PetStats({ stats, cardStyle = "" }: PetStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className={cardStyle}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-white">
                            {stat.icon} {stat.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={stat.value} className="mb-2 bg-gray-500" />
                        <p className="text-sm text-gray-300">{stat.value}/100</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}