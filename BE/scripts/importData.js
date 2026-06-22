const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow_dev';
const dataDir = path.join(__dirname, '../../data');

const fileToCollection = {
  'users.json': 'users',
  'products.json': 'products',
  'productinstances.json': 'productinstances',
  'categories.json': 'categories',
  'vouchers.json': 'vouchers',
  'banners.json': 'banners',
  'blogs.json': 'blogs',
  'alerts.json': 'alerts',
  'collaterals.json': 'collaterals',
  'deposits.json': 'deposits',
  'payments.json': 'payments',
  'pricingrules.json': 'pricingrules',
  'rentorders.json': 'rentorders',
  'rentorderitems.json': 'rentorderitems',
  'returnrecords.json': 'returnrecords',
  'saleorders.json': 'saleorders',
  'saleorderitems.json': 'saleorderitems',
  'sizeguides.json': 'sizeguides',
  'fittingbookings.json': 'bookings',
};

const parseMongoJSON = (value) => {
  if (Array.isArray(value)) {
    return value.map(parseMongoJSON);
  }

  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 1 && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    if (Object.keys(value).length === 1 && value.$date) {
      return new Date(value.$date);
    }

    const parsed = {};
    for (const [key, nested] of Object.entries(value)) {
      parsed[key] = parseMongoJSON(nested);
    }
    return parsed;
  }

  return value;
};

async function runImport() {
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    console.log(`Connected to MongoDB: ${mongoUri}`);

    for (const [filename, collectionName] of Object.entries(fileToCollection)) {
      const filePath = path.join(dataDir, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping missing file: ${filename}`);
        continue;
      }

      console.log(`\nProcessing ${filename} -> ${collectionName}`);
      const rawContent = fs.readFileSync(filePath, 'utf8').trim();

      let rawJson;
      try {
        rawJson = JSON.parse(rawContent);
      } catch (err) {
        console.error(`Failed to parse ${filename}:`, err.message);
        continue;
      }

      const dataArray = Array.isArray(rawJson) ? rawJson : [rawJson];
      if (dataArray.length === 0) {
        console.log(`No documents in ${filename}, skipping`);
        continue;
      }

      const parsedDocs = parseMongoJSON(dataArray);

      await db.collection(collectionName).deleteMany({});
      const result = await db.collection(collectionName).insertMany(parsedDocs);
      console.log(`Imported ${result.insertedCount} documents into ${collectionName}`);
    }

    console.log('\nDatabase import completed successfully.');
  } catch (error) {
    console.error('Data import failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runImport();
