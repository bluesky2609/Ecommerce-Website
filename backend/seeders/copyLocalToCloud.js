require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/hody_db';
const CLOUD_URI = process.env.MONGODB_URI;

(async () => {
  console.log('Connecting to local MongoDB...');
  const local = mongoose.createConnection(LOCAL_URI);
  await local.asPromise();
  console.log('✅ Local connected:', local.db.databaseName);

  console.log('Connecting to cloud MongoDB...');
  const cloud = mongoose.createConnection(CLOUD_URI);
  await cloud.asPromise();
  console.log('✅ Cloud connected:', cloud.db.databaseName);

  const localDb = local.db;
  const cloudDb = cloud.db;

  const collections = await localDb.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections in local DB\n`);

  for (const col of collections) {
    const name = col.name;
    const docs = await localDb.collection(name).find({}).toArray();
    const cloudCount = await cloudDb.collection(name).countDocuments();

    if (cloudCount > 0) {
      await cloudDb.collection(name).deleteMany({});
    }

    if (docs.length > 0) {
      await cloudDb.collection(name).insertMany(docs);
    }

    console.log(`  ${name}: copied ${docs.length} docs (was ${cloudCount} on cloud)`);
  }

  await local.close();
  await cloud.close();
  console.log('\n✅ Done! All local data has been copied to cloud hody_db.');
})().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
