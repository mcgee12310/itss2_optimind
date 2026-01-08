// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { getCurrentUser } from "@/utils/auth-server";

// // GET /api/rooms - Get active rooms
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const type = searchParams.get("type");
//     const search = searchParams.get("search");

//     const where: any = { isActive: true };
    
//     if (type) where.type = type;
//     if (search) {
//       where.name = { contains: search, mode: "insensitive" };
//     }

//     const rooms = await prisma.room.findMany({
//       where,
//       include: {
//         members: {
//           include: {
//             user: {
//               select: { id: true, username: true, email: true },
//             },
//           },
//         },
//         _count: {
//           select: { members: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ rooms });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
//   }
// }

// // POST /api/rooms - Create room
// export async function POST(req: Request) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { name, type, maxMembers, description, password } = body;

//     if (!name || !type) {
//       return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
//     }

//     const room = await prisma.room.create({
//       data: {
//         name,
//         type,
//         maxMembers: maxMembers || 10,
//         description,
//         password,
//         members: {
//           create: {
//             userId: user.id,
//           },
//         },
//       },
//       include: {
//         members: {
//           include: {
//             user: {
//               select: { id: true, username: true, email: true, avatarUrl: true },
//             },
//           },
//           orderBy: { joinedAt: "asc" },
//         },
//         _count: {
//           select: { members: true },
//         },
//       },
//     });

//     return NextResponse.json({ room, success: true });
//   } catch (e: any) {
//     console.error("Room creation error:", e);
//     return NextResponse.json(
//       { error: e.message || "Failed to create room" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/utils/auth-server";

// GET /api/rooms - Get active rooms
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = { isActive: true };
    
    if (type) where.type = type;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

   
    const sanitizedRooms = rooms.map((room: any) => ({
      ...room,
      isPrivate: !!room.password && room.password.length > 0, 
      password: null, 
    }));

    return NextResponse.json({ rooms: sanitizedRooms });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

// POST /api/rooms - Create room
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, maxMembers, description, password } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        type,
        maxMembers: maxMembers || 10,
        description,
        password: password || null, 
        members: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    const sanitizedRoom = {
        ...room,
        isPrivate: !!room.password,
        password: null
    };

    return NextResponse.json({ room: sanitizedRoom, success: true });
  } catch (e: any) {
    console.error("Room creation error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to create room" },
      { status: 500 }
    );
  }
}