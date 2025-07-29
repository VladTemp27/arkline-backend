import express from 'express';
import dotenv from 'dotenv';

dotenv.config({path: './.env'})

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({message: 'Auth service is running'}); 
})

app.use('/login')

try{
    app.listen(PORT, () => {
        console.log(`Auth service is running on port ${PORT}`);
    });
}catch(error){
    console.error('Error starting the server:', error);
}