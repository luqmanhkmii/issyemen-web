import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/iss_yemen_club';

async function checkConnection() {
  console.log('\n🔍 Checking Database Connection...\n');
  console.log('='.repeat(60));
  
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Database is already connected!');
    console.log(`   Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`   Host: ${mongoose.connection.host || 'unknown'}`);
    await mongoose.disconnect();
    process.exit(0);
  }
  
  // Try to connect
  const isAtlas = MONGO_URI.includes('mongodb+srv://');
  const isLocal = MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1');
  
  console.log(`📡 Connection String: ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`   Type: ${isAtlas ? '☁️  MongoDB Atlas (Cloud)' : isLocal ? '💻 Local MongoDB' : '🌐 Remote MongoDB'}\n`);
  
  const connectionOptions = {
    ...(isAtlas ? {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    } : {
      ssl: false,
      directConnection: true,
    }),
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  };
  
  try {
    console.log('🔌 Attempting to connect...');
    await mongoose.connect(MONGO_URI, connectionOptions);
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`   Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`   Host: ${mongoose.connection.host || 'unknown'}`);
    await mongoose.disconnect();
    console.log('\n✅ Connection test successful!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Tip: Check your MongoDB username and password in MONGO_URI');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Check your network connection and MongoDB Atlas IP whitelist');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Tip: Check your MongoDB connection string and network access');
    }
    
    process.exit(1);
  }
}

checkConnection();
