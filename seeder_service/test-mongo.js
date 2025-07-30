import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: './user-service/.env' });

console.log('🧪 Testing MongoDB connection...');

const connectionString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}?authSource=admin`;

console.log('Connection string (password hidden):');
console.log(`mongodb://${process.env.MONGO_USERNAME}:***@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}?authSource=admin`);

async function testConnection() {
    let client;
    try {
        console.log('🔗 Attempting to connect...');
        client = new MongoClient(connectionString);
        await client.connect();
        console.log('✅ Connected successfully!');
        
        const db = client.db('user_service');
        console.log('📊 Testing database access...');
        
        const collections = await db.listCollections().toArray();
        console.log('📋 Available collections:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('📡 Disconnected');
        }
    }
}

testConnection();
