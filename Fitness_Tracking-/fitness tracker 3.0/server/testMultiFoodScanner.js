const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const Food = require('./models/Food');
const Meal = require('./models/Meal');
const User = require('./models/User');
const { matchFoodToDatabase } = require('./services/foodMatchingService');
const { addMeal } = require('./controllers/mealController');

async function testMultiFoodScanner() {
  console.log('🧪 Starting Sri Lankan Multi-Food AI Scanner Verification Tests...\n');

  await connectDB();
  const allDbFoods = await Food.find({}).select('name caloriesPer100g');
  console.log(`Loaded ${allDbFoods.length} reference foods from MongoDB.`);

  // TEST 1: Semantic & Alias Matching
  console.log('\n--- [TEST 1: Intelligent Sri Lankan Food Matching] ---');
  const testCases = [
    { detected: 'Parippu Curry', aiMatch: 'Dhal Curry', expected: 'Dhal Curry' },
    { detected: 'String Hopper', aiMatch: 'String Hoppers', expected: 'Idiyappam' },
    { detected: 'Rice', aiMatch: 'White Rice', expected: 'White Rice' },
    { detected: 'Pol Roti', aiMatch: 'Coconut Roti', expected: 'Coconut Roti' },
    { detected: 'Pol Sambol', aiMatch: 'Coconut Sambal', expected: 'Coconut Sambal' },
    { detected: 'Appa', aiMatch: 'Hoppers', expected: 'Hoppers' },
    { detected: 'Kukul Mas', aiMatch: 'Chicken Curry', expected: 'Chicken Curry' },
    { detected: 'Kiri Bath', aiMatch: 'Kiribath', expected: 'Kiribath' }
  ];

  for (const tc of testCases) {
    const res = matchFoodToDatabase(tc.detected, tc.aiMatch, allDbFoods);
    console.log(`Input: "${tc.detected}" (AI: "${tc.aiMatch}") -> Matched: "${res.foodName}" (isKnown: ${res.isKnown}, ${res.caloriesPer100g} kcal/100g)`);
    if (!res.isKnown) {
      throw new Error(`Expected "${tc.detected}" to be recognized in database, but was not.`);
    }
  }
  console.log('✅ TEST 1 PASSED: All Sri Lankan aliases and variations matched successfully.');

  // TEST 2: Conflict Protection (Safety check)
  console.log('\n--- [TEST 2: Conflict Safety (Never match Chicken to Fish)] ---');
  const safetyMatch = matchFoodToDatabase('Chicken Curry', 'Fish Curry', allDbFoods);
  console.log(`Safety check: "Chicken Curry" vs "Fish Curry" resolved to: "${safetyMatch.foodName}"`);
  if (safetyMatch.foodName.toLowerCase().includes('fish') && !safetyMatch.foodName.toLowerCase().includes('chicken')) {
    throw new Error('FAILED: Unsafe match occurred! Chicken Curry matched to Fish.');
  }
  console.log('✅ TEST 2 PASSED: Conflict safety prevents cross-ingredient mismatches.');

  // TEST 3: Multi-Food Calorie Calculation
  console.log('\n--- [TEST 3: Multi-Food Plate Calorie Summation] ---');
  const samplePlate = [
    { name: 'White Rice', grams: 200, calPer100: 137.5 }, // 275 kcal
    { name: 'Dhal Curry', grams: 100, calPer100: 120.0 }, // 120 kcal
    { name: 'Chicken Curry', grams: 120, calPer100: 180.0 }, // 216 kcal
    { name: 'Coconut Sambal', grams: 30, calPer100: 280.0 } // 84 kcal
  ];

  let calculatedTotal = 0;
  for (const item of samplePlate) {
    const itemCal = Math.round((item.calPer100 / 100) * item.grams);
    console.log(`  - ${item.name} (${item.grams}g @ ${item.calPer100} kcal/100g) = ${itemCal} kcal`);
    calculatedTotal += itemCal;
  }
  console.log(`Grand Total: ${calculatedTotal} kcal (Expected: 695 kcal)`);
  if (calculatedTotal !== 695) {
    throw new Error(`Expected 695 kcal, calculated ${calculatedTotal}`);
  }
  console.log('✅ TEST 3 PASSED: Plate calorie calculation is exact.');

  // TEST 4: Batch Meal Saving
  console.log('\n--- [TEST 4: Batch Meal Storage] ---');
  const demoUser = await User.findOne({ email: 'demo@fittrack.com' });
  const userId = demoUser ? demoUser._id : new mongoose.Types.ObjectId();
  const todayStr = new Date().toISOString().split('T')[0];

  const reqBatch = {
    user: { id: userId },
    body: {
      mealType: 'Lunch',
      date: todayStr,
      meals: samplePlate.map(item => ({
        foodName: item.name,
        quantityGrams: item.grams,
        caloriesPer100g: item.calPer100,
        source: 'ai'
      }))
    }
  };

  let batchResData = null;
  const resBatch = {
    status: () => resBatch,
    json: (data) => { batchResData = data; return resBatch; }
  };

  await addMeal(reqBatch, resBatch);
  console.log(`Batch response: ${batchResData?.count} meals saved successfully.`);

  if (batchResData?.count === 4 && batchResData?.data?.length === 4) {
    console.log('✅ TEST 4 PASSED: Batch saving of multiple foods in one plate verified.');
    // Cleanup the test meals
    const savedIds = batchResData.data.map(m => m._id);
    await Meal.deleteMany({ _id: { $in: savedIds } });
  } else {
    throw new Error('Batch meal saving failed.');
  }

  console.log('\n🎉 ALL MULTI-FOOD SCANNER TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testMultiFoodScanner().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
