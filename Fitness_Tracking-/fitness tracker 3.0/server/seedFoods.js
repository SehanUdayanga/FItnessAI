const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Food = require('./models/Food');

/**
 * Seed the foods collection from the Sri Lankan Common Foods dataset.
 * Uses upsert to avoid duplicate food names and ensure safe re-execution.
 */
const seedFoodsData = async () => {
  try {
    const dataFilePath = path.join(__dirname, 'data', 'foodsData.json');
    if (!fs.existsSync(dataFilePath)) {
      console.warn('⚠️ foodsData.json not found at:', dataFilePath);
      return;
    }

    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const foods = JSON.parse(rawData);

    if (!Array.isArray(foods) || foods.length === 0) {
      console.warn('⚠️ No food records found to seed.');
      return;
    }

    const bulkOps = foods.map((food) => ({
      updateOne: {
        filter: { name: { $regex: new RegExp(`^${food.name.trim()}$`, 'i') } },
        update: {
          $set: {
            name: food.name.trim(),
            caloriesPer100g: Number(food.caloriesPer100g)
          }
        },
        upsert: true
      }
    }));

    await Food.bulkWrite(bulkOps);

    const totalCount = await Food.countDocuments();
    console.log(`🥗 Sri Lankan Foods Reference Database Seeded: ${totalCount} foods loaded.`);
  } catch (error) {
    console.error('❌ Error seeding foods dataset:', error.message);
  }
};

// Allow running directly via "node seedFoods.js"
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  const connectDB = require('./config/db');

  connectDB().then(async () => {
    await seedFoodsData();
    console.log('✅ Seeding completed.');
    process.exit(0);
  });
}

module.exports = { seedFoodsData };
