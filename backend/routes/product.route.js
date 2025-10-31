import express from 'express'
import { getAllProducts } from '../controllers/products.controller.js'
import { adminAuth, userAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()


router.get('/', userAuth, adminAuth, getAllProducts)





export default router