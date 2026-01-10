-- Seeding shop items
INSERT INTO "ShopItem" (id, name, description, price, type, data) VALUES
  ('apple-1', 'Apple', 'A fresh apple that restores hunger', 10, 'food', NULL),
  ('sandwich-1', 'Sandwich', 'A delicious sandwich', 20, 'food', NULL),
  ('pizza-1', 'Pizza', 'A tasty pizza slice', 30, 'food', NULL),
  ('desk-1', 'Study Desk', 'A nice desk for your pet', 100, 'decoration', NULL),
  ('bookshelf-1', 'Bookshelf', 'Store your favorite books', 150, 'decoration', NULL),
  ('plant-1', 'Plant Pot', 'A beautiful plant for decoration', 50, 'decoration', NULL),
  ('ball-1', 'Ball', 'A bouncy ball to play with', 15, 'toy', NULL),
  ('puzzle-1', 'Puzzle', 'A fun puzzle game', 25, 'toy', NULL),
  ('bg-forest-1', 'Forest Background', 'A peaceful forest scene', 200, 'background', NULL),
  ('bg-beach-1', 'Beach Background', 'Relax at the beach', 200, 'background', NULL),
  ('bg-space-1', 'Space Background', 'Study among the stars', 250, 'background', NULL),
  ('pet-dog-1', 'Dog Pet', 'Adopt a cute dog as your pet', 500, 'pet', '{"type": "dog", "name": "Buddy"}'),
  ('pet-cat-1', 'Cat Pet', 'Adopt a fluffy cat', 400, 'pet', '{"type": "cat", "name": "Whiskers"}'),
  ('pet-bird-1', 'Bird Pet', 'Adopt a colorful bird', 300, 'pet', '{"type": "bird", "name": "Tweety"}'),
  ('game-play-1', '1 Game Play', 'Buy 1 extra game session', 50, 'game_play', NULL),
  ('game-play-2', '2 Game Plays', 'Buy 2 extra game sessions', 90, 'game_play', NULL),
  ('game-play-3', '3 Game Plays', 'Buy 3 extra game sessions', 120, 'game_play', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seeding demo user
INSERT INTO "User" (email, name, passwordHash, coins, level, exp) VALUES
  ('demo@optimind.com', 'Demo User', '$2a$10$X5xK8fQb.7EqV1KZlY3.JeZ8QYQ8zQZJnLYxJYYJYYJYYJYYJYYJY', 2000, 5, 250)
ON CONFLICT (email) DO UPDATE SET coins = 2000;

-- Seeding demo pet
INSERT INTO "Pet" (userId, name, type, level, experience, hunger, happiness, energy) VALUES
  ((SELECT id FROM "User" WHERE email = 'demo@optimind.com'), 'Buddy', 'dog', 2, 0, 80, 90, 70)
ON CONFLICT (userId) DO UPDATE SET experience = 0;

-- Seeding demo tasks
INSERT INTO "Task" (title, description, status, priority, dueDate, userId) VALUES
  ('Complete Math Homework', 'Finish chapter 5 exercises', 'todo', 'high', NOW() + INTERVAL '1 day', (SELECT id FROM "User" WHERE email = 'demo@optimind.com')),
  ('Read History Chapter', 'Read and summarize chapter 10', 'in_progress', 'medium', NOW() + INTERVAL '2 days', (SELECT id FROM "User" WHERE email = 'demo@optimind.com')),
  ('Practice English', 'Review vocabulary and grammar', 'completed', 'low', NULL, (SELECT id FROM "User" WHERE email = 'demo@optimind.com'))
ON CONFLICT DO NOTHING;

-- Seeding demo room
INSERT INTO "Room" (name, description, type, maxMembers, isActive) VALUES
  ('Morning Study Group', 'Join us for focused study sessions', 'study', 10, true)
ON CONFLICT DO NOTHING;

-- Adding demo user to room
INSERT INTO "RoomMember" (roomId, userId) VALUES
  ((SELECT id FROM "Room" WHERE name = 'Morning Study Group'), (SELECT id FROM "User" WHERE email = 'demo@optimind.com'))
ON CONFLICT DO NOTHING;