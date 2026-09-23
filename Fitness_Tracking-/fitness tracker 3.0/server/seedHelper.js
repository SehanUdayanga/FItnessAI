const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Meal = require('./models/Meal');
const WaterIntake = require('./models/WaterIntake');
const WeightRecord = require('./models/WeightRecord');
const HealthMetric = require('./models/HealthMetric');

const seedDemoData = async () => {
  try {
    // 1. Seed / Ensure Admin Account
    const adminEmail = 'admin@fittrack.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash('AdminPass123!', salt);

      adminUser = await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin'
      });

      await Profile.create({
        userId: adminUser._id,
        age: 30,
        gender: 'Prefer not to say',
        height: 180,
        currentWeight: 75.0,
        targetWeight: 75.0,
        healthGoal: 'Maintain Weight'
      });

      console.log('🛡️ Admin account created: admin@fittrack.com');
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('🛡️ Updated existing account to admin role: admin@fittrack.com');
    }

    // 2. Seed Demo User
    const demoEmail = 'demo@fittrack.com';
    let existingDemoUser = await User.findOne({ email: demoEmail });

    if (!existingDemoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Demo123', salt);

      const demoUser = await User.create({
        name: 'Alex',
        email: demoEmail,
        password: hashedPassword,
        role: 'user'
      });

      // Create Demo Profile
      await Profile.create({
        userId: demoUser._id,
        age: 26,
        gender: 'Male',
        height: 175,
        currentWeight: 68.5,
        targetWeight: 65.0,
        healthGoal: 'Lose Weight'
      });

      const today = new Date();
      const formatDate = (daysAgo) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      const todayStr = formatDate(0);

      // 1. Weight Records
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

        const heightM = 1.75;
        const bmi = parseFloat((item.weight / (heightM * heightM)).toFixed(1));
        let bmiCategory = 'Normal';
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal';
        else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
        else if (bmi >= 30) bmiCategory = 'Obese';

        await HealthMetric.create({
          userId: demoUser._id,
          weight: item.weight,
          bmi,
          bmiCategory,
          date: recordDate
        });
      }

      // 2. Today's Meals
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

      // 3. Today's Water Intake
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

      for (let i = 1; i <= 6; i++) {
        const pastDate = formatDate(i);
        await WaterIntake.create({ userId: demoUser._id, amount: 2000 + ((i * 100) % 500), date: pastDate });
      }

      console.log('🎉 Demo user demo@fittrack.com created.');
    }

    console.log('\n==================================================');
    console.log('🌟 FITTRACK SYSTEM SEEDED ACCOUNTS:');
    console.log('👤 USER ACCOUNT:');
    console.log('   Email:    demo@fittrack.com');
    console.log('   Password: Demo123');
    console.log('   Role:     user');
    console.log('🛡️ ADMIN ACCOUNT:');
    console.log('   Email:    admin@fittrack.com');
    console.log('   Password: AdminPass123!');
    console.log('   Role:     admin');
    console.log('==================================================\n');
  } catch (error) {
    console.error('Auto Seeding Error:', error.message);
  }
};

module.exports = { seedDemoData };
