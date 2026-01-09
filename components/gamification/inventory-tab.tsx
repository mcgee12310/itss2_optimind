import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Backpack } from "lucide-react";
import { InventoryItem } from "./types";
import { InventoryItemCard } from "./inventory-item-card";

interface InventoryTabProps {
    inventory: InventoryItem[];
    cardStyle?: string;
}

export function InventoryTab({ inventory, cardStyle = "" }: InventoryTabProps) {
    if (inventory.length === 0) {
        return (
            <Card className={cardStyle}>
                <CardContent className="py-12 text-center">
                    <Backpack className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-300">Túi đồ trống. Mua vật phẩm từ cửa hàng!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {inventory.map((item) => (
                    <InventoryItemCard
                        key={item.id}
                        item={item}
                        cardStyle={cardStyle}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}