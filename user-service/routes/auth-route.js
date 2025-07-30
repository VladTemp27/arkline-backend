import express from 'express';

import { handleAuth, handleCreateUser } from '../controller/auth-controller.js';

const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/authenticate', handleAuth);
authRouter.post('/create-user', handleCreateUser); // secure this route later

export { authRouter };