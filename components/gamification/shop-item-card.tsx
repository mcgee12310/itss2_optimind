import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShopItem } from "./types";
import { getItemIcon } from "./utils";

interface ShopItemCardProps {
    item: ShopItem;
    userCoins: number;
    onBuyItem: (itemId: string) => void;
    cardStyle?: string;
}

export function ShopItemCard({ item, userCoins, onBuyItem, cardStyle = "" }: ShopItemCardProps) {
    return (
        <Card className={cardStyle}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-white">
                            {getItemIcon(item.type)} {item.name}
                        </CardTitle>
                        <p className="text-sm text-gray-300 mt-1">
                            {item.description}
                        </p>
                    </div>
                    <Badge variant="outline" className="border-gray-400 text-white bg-gray-600/50">
                        {item.type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{item.price} 💰</span>
                    <Button
                        onClick={() => onBuyItem(item.id)}
                        disabled={userCoins < item.price}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        Mua
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
