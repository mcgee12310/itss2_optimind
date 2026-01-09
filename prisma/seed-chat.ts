// Script to seed chat data for testing
import { prisma } from '../lib/prisma';

async function seedChatData() {
  console.log('🌱 Seeding chat data...');

  try {
    // Create test users if they don't exist
    const user1 = await prisma.user.upsert({
      where: { email: 'user1@test.com' },
      update: {},
      create: {
        email: 'user1@test.com',
        name: 'Nguyễn Văn A',
        username: 'vana',
        passwordHash: 'test123',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'user2@test.com' },
      update: {},
      create: {
        email: 'user2@test.com',
        name: 'Trần Thị B',
        username: 'thib',
        passwordHash: 'test123',
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
    });

    const user3 = await prisma.user.upsert({
      where: { email: 'user3@test.com' },
      update: {},
      create: {
        email: 'user3@test.com',
        name: 'Lê Văn C',
        username: 'vanc',
        passwordHash: 'test123',
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
    });

    console.log('✅ Created test users:', user1.name, user2.name, user3.name);

    // Create test rooms
    const room1 = await prisma.room.create({
      data: {
        name: 'Chat với Nguyễn Văn A',
        type: 'direct',
        members: {
          create: [
            { userId: user1.id },
            { userId: user2.id },
          ],
        },
      },
    });

    const room2 = await prisma.room.create({
      data: {
        name: 'Nhóm Học Tập',
        type: 'group',
        members: {
          create: [
            { userId: user1.id },
            { userId: user2.id },
            { userId: user3.id },
          ],
        },
      },
    });

    const room3 = await prisma.room.create({
      data: {
        name: 'Team Project',
        type: 'group',
        members: {
          create: [
            { userId: user2.id },
            { userId: user3.id },
          ],
        },
      },
    });

    console.log('✅ Created test rooms:', room1.name, room2.name, room3.name);

    // Create test messages
    await prisma.message.createMany({
      data: [
        {
          roomId: room1.id,
          userId: user1.id,
          content: 'Chào bạn! Hôm nay học bài chưa?',
        },
        {
          roomId: room1.id,
          userId: user2.id,
          content: 'Mình đang làm rồi, bạn cần giúp gì không?',
        },
        {
          roomId: room2.id,
          userId: user1.id,
          content: 'Các bạn chuẩn bị bài tập chưa nhỉ?',
        },
        {
          roomId: room2.id,
          userId: user3.id,
          content: 'Mình đã làm xong phần của mình rồi',
        },
        {
          roomId: room3.id,
          userId: user2.id,
          content: 'Meeting lúc 2h chiều nhé!',
        },
      ],
    });

    console.log('✅ Created test messages');

    console.log('🎉 Chat data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding chat data:', error);
  }
}

seedChatData();
