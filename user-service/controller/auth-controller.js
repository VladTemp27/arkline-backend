import { getUserByCredentials, createUser } from "../dal/user-dal.js";
import { jwtEncode } from "../util/jwt-util.js";
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

export { handleAuth, handleCreateUser };