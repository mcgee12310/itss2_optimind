import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding database...');

  // Create shop items
  const shopItems = [
    // Food items
    {
      id: 'apple-1',
      name: 'Apple',
      description: 'A fresh apple that restores hunger',
      price: 10,
      type: 'food',

    },
    {
      id: 'sandwich-1',
      name: 'Sandwich',
      description: 'A delicious sandwich',
      price: 20,
      type: 'food',

    },
    {
      id: 'pizza-1',
      name: 'Pizza',
      description: 'A tasty pizza slice',
      price: 30,
      type: 'food',

    },
    // Decoration items
    {
      id: 'desk-1',
      name: 'Study Desk',
      description: 'A nice desk for your pet',
      price: 100,
      type: 'decoration',

    },
    {
      id: 'bookshelf-1',
      name: 'Bookshelf',
      description: 'Store your favorite books',
      price: 150,
      type: 'decoration',

    },
    {
      id: 'plant-1',
      name: 'Plant Pot',
      description: 'A beautiful plant for decoration',
      price: 50,
      type: 'decoration',

    },
    // Toy items
    {
      id: 'ball-1',
      name: 'Ball',
      description: 'A bouncy ball to play with',
      price: 15,
      type: 'toy',

    },
    {
      id: 'puzzle-1',
      name: 'Puzzle',
      description: 'A fun puzzle game',
      price: 25,
      type: 'toy',

    },
    // Background items
    {
      id: 'bg-forest-1',
      name: 'Forest Background',
      description: 'A peaceful forest scene',
      price: 200,
      type: 'background',

    },
    {
      id: 'bg-beach-1',
      name: 'Beach Background',
      description: 'Relax at the beach',
      price: 200,
      type: 'background',

    },
    {
      id: 'bg-space-1',
      name: 'Space Background',
      description: 'Study among the stars',
      price: 250,
      type: 'background',

    },
    // Pet items
    {
      id: 'pet-dog-1',
      name: 'Dog Pet',
      description: 'Adopt a cute dog as your pet',
      price: 500,
      type: 'pet',

    },
    {
      id: 'pet-cat-1',
      name: 'Cat Pet',
      description: 'Adopt a fluffy cat',
      price: 400,
      type: 'pet',

    },
    {
      id: 'pet-bird-1',
      name: 'Bird Pet',
      description: 'Adopt a colorful bird',
      price: 300,
      type: 'pet',

    },
    // Game play items
    {
      id: 'game-play-1',
      name: 'Extra Game Play',
      description: 'Buy 1 extra game session',
      price: 50,
      type: 'game_play',

    },
    {
      id: 'game-play-5',
      name: '5 Game Plays',
      description: 'Buy 5 extra game sessions',
      price: 200,
      type: 'game_play',

    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log('✅ Shop items seeded');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@optimind.com' },
    update: {},
    create: {
      email: 'demo@optimind.com',
      name: 'Demo User',
      passwordHash: '$2a$10$X5xK8fQb.7EqV1KZlY3.JeZ8QYQ8zQZJnLYxJYYJYYJYYJYYJYYJY', // "password123"
      coins: 1000,
      level: 5,
      exp: 250,
    },
  });

  console.log('✅ Demo user created');

  // Create demo pet
  await prisma.pet.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Buddy',
      type: 'dog',
      hunger: 80,
      happiness: 90,
      energy: 70,
    },
  });

  console.log('✅ Demo pet created');

  // Create some demo tasks
  const tasks = [
    {
      title: 'Complete Math Homework',
      description: 'Finish chapter 5 exercises',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      userId: demoUser.id,
    },
    {
      title: 'Read History Chapter',
      description: 'Read and summarize chapter 10',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 172800000), // 2 days
      userId: demoUser.id,
    },
    {
      title: 'Practice English',
      description: 'Review vocabulary and grammar',
      status: 'completed',
      priority: 'low',
      completedAt: new Date(),
      userId: demoUser.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Demo tasks created');

  // Create a demo study room
  const room = await prisma.room.create({
    data: {
      name: 'Morning Study Group',
      description: 'Join us for focused study sessions',
      type: 'study',
      maxMembers: 10,
      isActive: true,
    },
  });

  // Add demo user to room
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: demoUser.id,
    },
  });

  console.log('✅ Demo room created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
