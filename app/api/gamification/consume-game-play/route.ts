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

// POST /api/gamification/consume-game-play - Consume 1 game play
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Find the game play item in inventory
      const inventoryItem = await tx.inventory.findFirst({
        where: {
          userId,
          itemId,
          item: {
            type: "game_play",
          },
          quantity: { gt: 0 },
        },
        include: {
          item: true,
        },
      });

      if (!inventoryItem) {
        throw new Error("No game play available");
      }

      // Consume 1 game play
      await tx.inventory.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: { decrement: 1 },
        },
      });

      return { success: true };
    });

    return NextResponse.json({ message: "Game play consumed successfully" });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Failed to consume game play" },
      { status: 500 }
    );
  }
}