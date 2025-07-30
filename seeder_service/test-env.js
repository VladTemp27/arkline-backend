console.log('Testing basic Node.js execution...');

import dotenv from 'dotenv';
dotenv.config({ path: './user-service/.env' });

console.log('Environment variables loaded:');
console.log('- MONGO_HOST:', process.env.MONGO_HOST);
console.log('- MONGO_USERNAME:', process.env.MONGO_USERNAME);
console.log('- MONGO_PORT:', process.env.MONGO_PORT);

console.log('Test completed successfully!');
