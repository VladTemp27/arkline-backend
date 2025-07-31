import { getUserByCredentials, createUser } from "../dal/user-dal.js";
import { jwtEncode, jwtDecode } from "../util/jwt-util.js";
import { redisClient } from "../util/redis-util.js";

async function handleAuth(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try{
        const userData = await getUserByCredentials(username, password);
        if (!userData) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const payload = {
            userId: userData.userId,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
        }

        const token = jwtEncode(payload);

        return res.status(200).json({
            message: 'Authentication successful',
            token: token,
            username: userData.username,

        });
    }catch(error){
        console.log(`Error: ${error}`)
        res.status(500).json({error: 'Internal server error'});
        return;
    }
}

function handleCreateUser(req, res) {
    const {userData} = req.body;

    if( !userData.username || !userData.firstName || !userData.lastName || !userData.password){
        return res.status(400).json({message: 'All fields are required'});
    }
    if(userData.password.length < 6){
        return res.status(400).json({message: 'Password must be at least 6 characters long'});
    }
    const createdUser = createUser(userData)
    return res.status(201).json({
        message: 'User created successfully',
        user: createdUser
    });
}

function handleAuthorize(req, res) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    try {
        const decoded = jwtDecode(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).send({ error: 'Invalid token' });
        }
        
        // Store user info in Redis for session management
        redisClient.set(decoded.userId, JSON.stringify(decoded), 'EX', 3600); // 1 hour expiration

        return res.status(200).send({ message: 'Authorization successful', username: decoded.username, role: decoded.role });
    } catch (error) {
        return res.status(401).send({ error: 'Invalid token' });
    }
}

export { handleAuth, handleCreateUser, handleAuthorize };