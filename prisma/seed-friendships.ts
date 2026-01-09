import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function seedFriendships() {
  console.log("🌱 Seeding friendships and users...");

  // Create test users if they don't exist
  const password = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "alice@test.com" },
    update: {},
    create: {
      email: "alice@test.com",
      name: "Alice",
      username: "alice",
      passwordHash: password,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      coins: 100,
      level: 5,
      exp: 250,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@test.com" },
    update: {},
    create: {
      email: "bob@test.com",
      name: "Bob",
      username: "bob",
      passwordHash: password,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      coins: 150,
      level: 4,
      exp: 180,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "charlie@test.com" },
    update: {},
    create: {
      email: "charlie@test.com",
      name: "Charlie",
      username: "charlie",
      passwordHash: password,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
      coins: 200,
      level: 6,
      exp: 300,
    },
  });

  console.log(`✅ Created users: Alice, Bob, Charlie`);
  console.log(`   Password for all: password123`);
  console.log(`   Alice ID: ${user1.id}`);
  console.log(`   Bob ID: ${user2.id}`);
  console.log(`   Charlie ID: ${user3.id}`);

  // Create some friend requests
  // Bob sends request to Alice (pending)
  const request1 = await prisma.friendship.upsert({
    where: {
      user1Id_user2Id: {
        user1Id: user2.id,
        user2Id: user1.id,
      },
    },
    update: {},
    create: {
      user1Id: user2.id,
      user2Id: user1.id,
      status: "pending",
    },
  });

  console.log(`✅ Created pending friend request: Bob -> Alice`);

  // Charlie sends request to Alice (pending)
  const request2 = await prisma.friendship.upsert({
    where: {
      user1Id_user2Id: {
        user1Id: user3.id,
        user2Id: user1.id,
      },
    },
    update: {},
    create: {
      user1Id: user3.id,
      user2Id: user1.id,
      status: "pending",
    },
  });

  console.log(`✅ Created pending friend request: Charlie -> Alice`);

  // Alice and Bob are already friends
  const friendship1 = await prisma.friendship.upsert({
    where: {
      user1Id_user2Id: {
        user1Id: user1.id,
        user2Id: user3.id,
      },
    },
    update: {},
    create: {
      user1Id: user1.id,
      user2Id: user3.id,
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  console.log(`✅ Created accepted friendship: Alice <-> Charlie`);

  console.log("\n📝 Test Instructions:");
  console.log("1. Login as Alice (alice@test.com / password123)");
  console.log("2. Go to Chat page");
  console.log("3. Check 'Lời mời' tab - you should see 2 pending requests from Bob and Charlie");
  console.log("4. Accept or decline the requests");
  console.log("\nOr:");
  console.log("1. Login as Bob (bob@test.com / password123)");
  console.log("2. Search for Alice and send a friend request");
}

seedFriendships()
  .catch((e) => {
    console.error("❌ Error seeding friendships:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
