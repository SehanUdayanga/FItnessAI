const connectDB = require('./config/db');
const { seedDemoData } = require('./seedHelper');

const runSeed = async () => {
  try {
    await connectDB();
    await seedDemoData();
    console.log('Seeding process finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  }
};

runSeed();
