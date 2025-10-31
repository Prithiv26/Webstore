import express from 'express'
import { toLogin, toLogout, toRefresh, toSignup } from '../controllers/auth.controller.js';

const router = express.Router()

router.post('/login', toLogin);
router.post('/signup', toSignup);
router.post('/logout', toLogout);
router.post('/refresh', toRefresh)

export default router