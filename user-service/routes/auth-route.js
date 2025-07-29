import express from 'express';

import { handleAuth } from './controller/auth-controller.js';

const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/authenticate', handleAuth);

export { authRouter };