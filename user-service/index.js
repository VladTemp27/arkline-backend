import express from 'express';
import dotenv from 'dotenv';

import { connectMongoDB, disconnectMongoDB } from './util/mongo-util.js';
import { connectRedis, redisClient } from './util/redis-util.js';

import { authRouter } from './routes/auth-route.js';

dotenv.config({path: './.env'})

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({message: 'User service is running'}); 
})

app.use('/auth', authRouter);

try{
    connectMongoDB();
    connectRedis();
    app.listen(PORT, () => {
        console.log(`User service is running on port ${PORT}`);
    });
}catch(error){
    console.error('Error starting the server:', error);
    disconnectMongoDB();
    redisClient.quit();
    process.exit(1);
}