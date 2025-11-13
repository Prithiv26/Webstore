import express from 'express'
import { createCheckoutSession , checkCheckoutSuccess} from '../controllers/payment.controller.js'
import { userAuth } from '../middlewares/auth.middleware.js'
const router = express.Router()

router.post('/create-checkout-session', userAuth, createCheckoutSession)
router.post('/checkout-success', userAuth, checkCheckoutSuccess)
export default router