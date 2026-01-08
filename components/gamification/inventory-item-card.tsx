import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "./types";
import { getItemIcon } from "./utils";

interface InventoryItemCardProps {
    item: InventoryItem;
    cardStyle?: string;
}

export function InventoryItemCard({ item, cardStyle = "" }: InventoryItemCardProps) {
    return (
        <Card className={cardStyle}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-white">
                            {getItemIcon(item.item.type)} {item.item.name}
                        </h3>
                        <p className="text-sm text-gray-300">
                            {item.item.description}
                        </p>
                    </div>
                    <Badge className="bg-gray-600/50 text-white border-gray-400">
                        {item.quantity}x
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
