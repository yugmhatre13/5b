import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testPerformance = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Please add your MONGO_URI to the .env file to run this test.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for index testing.");

    // Clear existing data
    console.log("Clearing existing users...");
    await User.deleteMany();

    // Insert sample data
    console.log("Inserting sample data (1000 users)...");
    const sampleUsers = [];
    const hobbiesList = ['Reading', 'Gaming', 'Cooking', 'Hiking', 'Swimming', 'Coding'];

    for (let i = 0; i < 1000; i++) {
      sampleUsers.push({
        name: `User${i}`,
        email: `user${i}@example.com`,
        age: Math.floor(Math.random() * 80) + 18,
        hobbies: [hobbiesList[i % 6], hobbiesList[(i + 1) % 6]],
        bio: `This is the bio for user ${i}. I enjoy ${hobbiesList[i % 6]}.`,
        userId: `hash_${i}_${Date.now()}`
      });
    }

    await User.insertMany(sampleUsers);
    console.log("Sample data inserted.");

    console.log("--- Index Performance Testing ---");

    // 1. Single Field Index on Name
    console.log("\n1. Testing Single Field Index (name: 'User500')");
    const nameStats = await User.find({ name: 'User500' }).explain("executionStats");
    printStats(nameStats);

    // 2. Compound Index on Email and Age
    console.log("\n2. Testing Compound Index (email: 'user300@example.com', age: { $gte: 20 })");
    const compoundStats = await User.find({ email: 'user300@example.com', age: { $gte: 20 } }).explain("executionStats");
    printStats(compoundStats);

    // 3. Multikey Index on Hobbies
    console.log("\n3. Testing Multikey Index (hobbies: 'Coding')");
    const multikeyStats = await User.find({ hobbies: 'Coding' }).explain("executionStats");
    printStats(multikeyStats);

    // 4. Text Index on Bio
    console.log("\n4. Testing Text Index ($text: { $search: 'bio for user 900' })");
    const textStats = await User.find({ $text: { $search: 'bio for user 900' } }).explain("executionStats");
    printStats(textStats);

    // 5. Hashed Index on userId
    const randomUser = sampleUsers[250];
    console.log(`\n5. Testing Hashed Index (userId: '${randomUser.userId}')`);
    const hashedStats = await User.find({ userId: randomUser.userId }).explain("executionStats");
    printStats(hashedStats);

    console.log("\nTesting Completed.");
    process.exit(0);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

const printStats = (stats) => {
  // Depending on Mongoose/MongoDB version, explain() structure varies slightly
  // Usually executionStats is inside the first element if returned as array, or direct object
  const execStats = Array.isArray(stats) ? stats[0].executionStats : stats.executionStats || stats.queryPlanner?.winningPlan?.executionStats || stats[0]?.queryPlanner?.winningPlan?.executionStats;
  
  if (execStats) {
    console.log(`  Keys Examined: ${execStats.totalKeysExamined}`);
    console.log(`  Documents Examined: ${execStats.totalDocsExamined}`);
    console.log(`  Execution Time (ms): ${execStats.executionTimeMillis}`);
  } else {
    // Fallback if explain returns a different structure
    const rawData = Array.isArray(stats) ? stats[0] : stats;
    console.log(JSON.stringify(rawData, null, 2));
  }
};

testPerformance();
