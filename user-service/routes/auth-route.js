import express from 'express';

import { handleAuth, handleCreateUser, handleAuthorize } from '../controller/auth-controller.js';

const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/authenticate', handleAuth);
authRouter.post('/create-user', handleCreateUser); // secure this route later
authRouter.post('/authorize', handleAuthorize);

export { authRouter };