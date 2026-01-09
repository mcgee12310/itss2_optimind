import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth-server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;

    let memberId = null;
    try {
      const text = await req.text();
      if (text) {
        const json = JSON.parse(text);
        memberId = json.memberId;
      }
    } catch (e) {
      console.warn("Error parsing leave body:", e);
    }

    console.log("Leaving room:", { roomId, userId: user.id, specificMemberId: memberId });


    if (memberId) {
      await prisma.roomMember.deleteMany({
        where: {
          id: memberId, 
          userId: user.id, 
        },
      });
    } else {
      await prisma.roomMember.deleteMany({
        where: {
          roomId: roomId,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Leave room error:", e);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}