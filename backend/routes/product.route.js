import express from 'express'
import { getAllProducts , getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, getProductsByCategory, toggleFeaturedProduct} from '../controllers/products.controller.js'
import { adminAuth, userAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()


router.get('/', userAuth, adminAuth, getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/recomended', getRecommendedProducts)
router.get('/category/:category', getProductsByCategory)
router.patch('/:id', userAuth, adminAuth, toggleFeaturedProduct)
router.post('/',  userAuth, adminAuth, createProduct)
router.delete('/:id', userAuth, adminAuth, deleteProduct)




export default router