const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Meal = require('./models/Meal');
const WaterIntake = require('./models/WaterIntake');
const WeightRecord = require('./models/WeightRecord');
const { seedFoodsData } = require('./seedFoods');

/**
 * Migration helper: merges legacy 'profiles' into 'users' collection
 * and drops obsolete 'profiles' & 'healthmetrics' collections from MongoDB.
 */
const migrateLegacyCollections = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // 1. Migrate legacy 'profiles' if present
    if (collectionNames.includes('profiles')) {
      const legacyProfiles = await db.collection('profiles').find({}).toArray();
      for (const profile of legacyProfiles) {
        if (profile.userId) {
          await User.findByIdAndUpdate(profile.userId, {
            $set: {
              age: profile.age || 25,
              gender: profile.gender || 'Male',
              height: profile.height || 170,
              targetWeight: profile.targetWeight || 65,
              healthGoal: profile.healthGoal || 'Maintain Weight',
              waterGoal: profile.waterGoal || 2500,
              profileImage: profile.profileImage || ''
            }
          });
        }
      }
      await db.dropCollection('profiles');
      console.log('🧹 Migrated profiles into users & dropped obsolete profiles collection');
    }

    // 2. Drop legacy 'healthmetrics' if present
    if (collectionNames.includes('healthmetrics')) {
      await db.dropCollection('healthmetrics');
      console.log('🧹 Dropped obsolete healthmetrics collection');
    }
  } catch (err) {
    console.warn('Migration Notice:', err.message);
  }
};

const seedDemoData = async () => {
  try {
    // Run migration / cleanup on startup
    await migrateLegacyCollections();

    // Seed Sri Lankan Foods Reference Database
    await seedFoodsData();

    const salt = await bcrypt.genSalt(10);

    // 1. Seed Admin User
    const adminEmail = 'admin@fittrack.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('Admin123', salt);
      adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        status: 'active',
        age: 30,
        gender: 'Prefer not to say',
        height: 175,
        targetWeight: 70,
        healthGoal: 'Maintain Weight',
        waterGoal: 2500
      });
      console.log('👑 Admin user seeded: admin@fittrack.com / Admin123');
    }

    // 2. Seed Demo User
    const demoEmail = 'demo@fittrack.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      console.log('💡 Demo user demo@fittrack.com already exists.');
      return;
    }

    // Create Demo User with full profile data in users collection
    const hashedPassword = await bcrypt.hash('Demo123', salt);

    demoUser = await User.create({
      name: 'Alex',
      email: demoEmail,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      age: 26,
      gender: 'Male',
      height: 175,
      targetWeight: 65.0,
      healthGoal: 'Lose Weight',
      waterGoal: 2500
    });

    const today = new Date();
    const formatDate = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const todayStr = formatDate(0);

    // 1. Weight Records (Over 4 weeks: 72.0kg down to latest 68.5kg)
    const weightHistory = [
      { daysAgo: 28, weight: 72.0 },
      { daysAgo: 21, weight: 71.2 },
      { daysAgo: 14, weight: 70.4 },
      { daysAgo: 7, weight: 69.3 },
      { daysAgo: 0, weight: 68.5 }
    ];

    for (const item of weightHistory) {
      const recordDate = formatDate(item.daysAgo);
      await WeightRecord.create({
        userId: demoUser._id,
        weight: item.weight,
        date: recordDate
      });
    }

    // 2. Today's Meals (Totaling 1,420 kcal)
    const todayMeals = [
      { mealType: 'Breakfast', foodName: 'Oatmeal + Banana', quantity: '1 bowl', calories: 320, date: todayStr },
      { mealType: 'Lunch', foodName: 'Grilled Chicken + Rice', quantity: '1 plate', calories: 520, date: todayStr },
      { mealType: 'Dinner', foodName: 'Vegetable Salad', quantity: '1 bowl', calories: 380, date: todayStr },
      { mealType: 'Snack', foodName: 'Fruit', quantity: '1 cup', calories: 200, date: todayStr }
    ];

    for (const meal of todayMeals) {
      await Meal.create({
        userId: demoUser._id,
        ...meal
      });
    }

    // Past 6 days meals
    for (let i = 1; i <= 6; i++) {
      const pastDate = formatDate(i);
      await Meal.create({ userId: demoUser._id, mealType: 'Breakfast', foodName: 'Scrambled Eggs & Toast', quantity: '1 plate', calories: 400, date: pastDate });
      await Meal.create({ userId: demoUser._id, mealType: 'Lunch', foodName: 'Turkey Sandwich & Apple', quantity: '1 sandwich', calories: 550, date: pastDate });
      await Meal.create({ userId: demoUser._id, mealType: 'Dinner', foodName: 'Salmon & Steamed Broccoli', quantity: '1 fillet', calories: 600, date: pastDate });
      await Meal.create({ userId: demoUser._id, mealType: 'Snack', foodName: 'Mixed Nuts', quantity: '1 handful', calories: 180, date: pastDate });
    }

    // 3. Today's Water Intake (Totaling 1,800 ml out of 2,500 ml -> 72%)
    const todayWater = [
      { amount: 500, date: todayStr },
      { amount: 500, date: todayStr },
      { amount: 500, date: todayStr },
      { amount: 300, date: todayStr }
    ];

    for (const water of todayWater) {
      await WaterIntake.create({
        userId: demoUser._id,
        ...water
      });
    }

    // Past days water logs
    for (let i = 1; i <= 6; i++) {
      const pastDate = formatDate(i);
      await WaterIntake.create({ userId: demoUser._id, amount: 2000 + ((i * 100) % 500), date: pastDate });
    }

    console.log('\n==================================================');
    console.log('🎉 OFFICIAL 4-COLLECTION DATABASE SEEDED!');
    console.log('👑 Admin: admin@fittrack.com  / Admin123');
    console.log('👤 User:  demo@fittrack.com   / Demo123');
    console.log('==================================================\n');
  } catch (error) {
    console.error('Auto Seeding Error:', error.message);
  }
};

module.exports = { seedDemoData };
