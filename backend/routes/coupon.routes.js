import express from 'express'
import { userAuth } from '../middlewares/auth.middleware.js'
import { getCoupon, validateCoupon } from '../controllers/coupons.controller.js'

const router = express.Router()

router.get('/', userAuth, getCoupon)
router.post('/validate', userAuth, validateCoupon)

export default router