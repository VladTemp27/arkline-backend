import { getDB } from '../util/mongo-util.js';
import { ObjectId } from 'mongodb';

async function createUser(userData) {
    const database = getDB();
    const collection = database.collection('users');
    
    try {
        // Check if user already exists
        const existingUser = await collection.findOne({ username: userData.username });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const result = await collection.insertOne({
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password, // TODO: Hash this in production!
            role: userData.role || 'employee',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // Convert ObjectId to string for consistent usage with accomplishment tracker
        const userId = await result.insertedId.toString();
        console.log(`User created with ID: ${userId}`);
        return { 
            userId, 
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'employee'
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function getUserByCredentials(username, password) {
    const database = getDB();
    const collection = database.collection('users');
    
    try {
        // Get user by username only
        const user = await collection.findOne({ username: username });
        
        if (!user) {
            return null; // User not found
        }
        
        // TODO: In production, use bcrypt.compare(password, user.password)
        if (user.password !== password) {
            return null; // Invalid password
        }
        
        return {
            userId: user._id.toString(),
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

async function getUserById(userId) {
    const database = getDB();
    const collection = database.collection('users');
    
    try {
        // Convert string back to ObjectId for MongoDB query
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        
        if (user) {
            return {
                userId: user._id.toString(),
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
}




export { 
    createUser, 
    getUserByCredentials, 
    getUserById,
};