import express from 'express'
import { userAuth } from '../middlewares/auth.middleware.js'
import {getAllCartItems, addItemToCart, clearCart, deleteCartItem, modifyCartItemQuantity} from '../controllers/cart.controller.js'

const router = express.Router()

router.get('/', userAuth, getAllCartItems)
router.post('/', userAuth, addItemToCart)
router.delete('/:id', userAuth, deleteCartItem)
router.delete('/', userAuth, clearCart)
router.put('/:id', userAuth, modifyCartItemQuantity)



export default router