import {Request, Response, Router} from 'express';
import { getBodyData } from '../Controller/Controller';

const router = Router();

router.get('/data', getBodyData);

export default router;