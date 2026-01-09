import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserIdFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const userCookie = cookie.split(";").find((c) => c.trim().startsWith("user_data="));
  if (!userCookie) return null;
  try {
    const value = decodeURIComponent(userCookie.split("=")[1]);
    const user = JSON.parse(value);
    return user.id;
  } catch {
    return null;
  }
}

// POST /api/gamification/shop/buy - Buy item from shop
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, quantity = 1 } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Get item
      const item = await tx.shopItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      // Calculate quantity to buy
      let buyQuantity = quantity;
      if (item.type === 'game_play') {
        const num = parseInt(itemId.split('-')[2]) || 1;
        buyQuantity = num;
      }

      // Check user has enough coins
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const totalCost = item.price * quantity;
      if (user.coins < totalCost) {
        throw new Error("Not enough coins");
      }

      // Deduct coins from user
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: totalCost } },
      });

      // Handle different item types
      if (item.type === "pet") {
        // For pets, create or update pet
        const petData = JSON.parse(item.data || "{}");
        await tx.pet.upsert({
          where: { userId },
          update: {
            name: petData.name || item.name,
            type: petData.type || "cat",
            level: 1,
            hunger: 50,
            happiness: 50,
            energy: 50,
          },
          create: {
            userId,
            name: petData.name || item.name,
            type: petData.type || "cat",
          },
        });
        return { newBalance: user.coins - totalCost, petUpdated: true };
      } else {
        // For other items, add to inventory
        const existingInventory = await tx.inventory.findFirst({
          where: {
            userId,
            itemId,
          },
        });

        let inventory;
        if (existingInventory) {
          inventory = await tx.inventory.update({
            where: { id: existingInventory.id },
            data: {
              quantity: { increment: buyQuantity },
            },
          });
        } else {
          inventory = await tx.inventory.create({
            data: {
              userId,
              itemId,
              quantity: buyQuantity,
            },
          });
        }
        return { inventory: { ...inventory, item }, newBalance: user.coins - totalCost };
      }
    });

    return NextResponse.json({
      message: "Purchase successful",
      balance: result.newBalance,
      ...(result.inventory && { inventory: result.inventory }),
      ...(result.petUpdated && { petUpdated: true }),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to purchase item" },
      { status: 500 }
    );
  }
}
