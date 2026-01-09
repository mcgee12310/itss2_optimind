import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameSectionProps {
    gamePlays: number;
    cardStyle?: string;
    onNavigateToShop?: () => void;
}

export function GameSection({ gamePlays, cardStyle = "", onNavigateToShop }: GameSectionProps) {
    const hasPlays = gamePlays > 0;

    return (
        <Card className={cn("mt-8", cardStyle)}>
            <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold text-white">
                        {hasPlays ? "Sẵn sàng chơi game!" : "Trò chơi Unity"}
                    </h2>
                   <p className="text-gray-300">
                       {hasPlays ? (
                            <>Bạn có {gamePlays} lượt chơi game. Mỗi lần chơi sẽ tiêu tốn 1 lượt.</>
                        ) : (
                            <>Bạn chưa có lượt chơi game. Hãy mua lượt chơi từ cửa hàng để bắt đầu!</>
                        )}
                    </p>
                    {hasPlays ? (
                        <Button
                            onClick={() => window.location.href = '/game'}
                            size="lg"
                            className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                           <Gamepad2 className="w-6 h-6 mr-2" />
                          Chơi Game Ngay
                        </Button>
                    ) : (
                        <Button
                            onClick={onNavigateToShop}
                            size="lg"
                           className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <ShoppingBag className="w-6 h-6 mr-2" />
                            Mua Lượt Chơi
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
