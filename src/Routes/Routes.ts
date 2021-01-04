import {Request, Response, Router} from 'express';
import { getBodyData } from '../Controller/Controller';

const router = Router();

router.post('/data', getBodyData);

export default router;