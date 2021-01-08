import {Request, Response, Router} from 'express';
import { getBodyData } from '../Controller/Controller';
import  firebaseController  from '../Controller/FirebaseController';

const router = Router();

router.get('/data', getBodyData);
router.post('/create-user',firebaseController.createUser);
router.post('/login-user',firebaseController.loginUser);

export default router;