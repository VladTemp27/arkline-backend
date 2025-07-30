import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

console.log('🌱 Arkline HR Database Seeder v2');
console.log('================================');

// Load environment variables from user service
dotenv.config({ path: './user-service/.env' });
console.log('✅ Environment variables loaded');

// MongoDB connection details (use localhost since we're running outside Docker)
const mongoHost = process.env.MONGO_HOST === 'mongodb-arkline' ? 'localhost' : process.env.MONGO_HOST;
const connectionString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${mongoHost}:${process.env.MONGO_PORT}?authSource=admin`;

console.log(`🔗 Will connect to: mongodb://${process.env.MONGO_USERNAME}:***@${mongoHost}:${process.env.MONGO_PORT}?authSource=admin`);

let client;

async function runSeederV2() {
    try {
        console.log('\n🚀 Starting seeding process...');
        
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        client = new MongoClient(connectionString);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        // Get databases
        const userServiceDB = client.db('user_service');
        const accomplishmentTrackerDB = client.db('accomplishment_tracker');
        console.log('✅ Database references obtained');
        
        // Test database access
        const userCollections = await userServiceDB.listCollections().toArray();
        const accomplishmentCollections = await accomplishmentTrackerDB.listCollections().toArray();
        
        console.log(`📋 User service collections: ${userCollections.map(c => c.name).join(', ') || 'none'}`);
        console.log(`📋 Accomplishment tracker collections: ${accomplishmentCollections.map(c => c.name).join(', ') || 'none'}`);
        
        // Create a simple test user
        console.log('\n🌱 Creating test user...');
        const usersCollection = userServiceDB.collection('users');
        
        const testUser = {
            username: 'test.user',
            firstName: 'Test',
            lastName: 'User',
            password: 'test123',
            role: 'employee',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Check if user exists first
        const existingUser = await usersCollection.findOne({ username: 'test.user' });
        if (existingUser) {
            console.log('⚠️  Test user already exists, skipping creation');
        } else {
            const result = await usersCollection.insertOne(testUser);
            console.log(`✅ Test user created with ID: ${result.insertedId}`);
        }
        
        console.log('\n🎉 Seeding test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('📡 Disconnected from MongoDB');
        }
    }
}

runSeederV2();
