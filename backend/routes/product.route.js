import express from 'express'
import { getAllProducts , getFeaturedProducts, createProduct} from '../controllers/products.controller.js'
import { adminAuth, userAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()


router.get('/', userAuth, adminAuth, getAllProducts)
router.get('/featured', getFeaturedProducts)
router.post('/',  userAuth, adminAuth, createProduct)





export default router