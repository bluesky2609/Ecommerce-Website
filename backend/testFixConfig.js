require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const HomeConfig = require('./models/HomeConfig');

async function fixConfig() {
  await connectDB();
  const config = await HomeConfig.findOne();
  if (config) {
     const types = config.sections.map(s => s.type);
     if (!types.includes('collections')) config.sections.splice(1, 0, { title: 'Khám phá các bộ sưu tập', type: 'collections', enabled: true });
     if (!types.includes('promo')) config.sections.push({ title: 'Ưu đãi đặc biệt', type: 'promo', enabled: true });
     if (!types.includes('blogs')) config.sections.push({ title: 'Blog & Tin Tức', type: 'blogs', enabled: true });
     await config.save();
     console.log('Added missing sections to DB');
  }
  process.exit(0);
}
fixConfig();
