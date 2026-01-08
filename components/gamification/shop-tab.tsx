import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShopItem } from "./types";
import { ShopItemCard } from "./shop-item-card";

interface ShopTabProps {
    shopItems: ShopItem[];
    userCoins: number;
    onBuyItem: (itemId: string) => void;
    cardStyle?: string;
}

export function ShopTab({ shopItems, userCoins, onBuyItem, cardStyle = "" }: ShopTabProps) {
    return (
        <div className="space-y-4">
            {userCoins === 0 && (
                <Card className="border-amber-400/40 bg-amber-900/40 backdrop-blur-md text-amber-100">
                    <CardContent className="pt-6">
                        <p className="text-sm text-amber-200">
                            Bạn cần xu để mua vật phẩm. Hãy học tập với điểm tập trung cao để kiếm xu!
                            (1-3 xu/phút tùy theo điểm tập trung)
                        </p>
                    </CardContent>
                </Card>
            )}
            <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {shopItems.map((item) => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            userCoins={userCoins}
                            onBuyItem={onBuyItem}
                            cardStyle={cardStyle}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
