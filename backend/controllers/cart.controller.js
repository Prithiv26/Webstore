export const addItemToCart = async (req, res) => {
    const {productId} = req.body
    try {
        const user = req.user
        const productInCart = user.cartItems.find((product) => productId === product.product)
        if (productInCart){
            productInCart.quantity++;
        }
        else{
            user.cartItems.push({
                product: productId,
                quantity: 1
            })
        }

        await user.save()
        res.json(user.cartItems)

    } catch (error) {
        console.log('Error in addItemToCart controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const getAllCartItems = async (req, res) => {
    try {
        const cartItems = req.user.cartItems
        if (!cartItems){
            return res.status(404).json({
                message: 'Cart is Empty'
            })
        }
        res.json(cartItems)
    } catch (error) {
        console.log('Error in getAllCartItems controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const clearCart = async (req, res) => {
    try {
        const user = req.user
        user.cartItems = []
        await user.save()
        res.status(200).json({
            message: 'Cart cleared successfully'
        })
    } catch (error) {
        console.log('Error in clearCart controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const deleteCartItem = async (req, res) => {
    const productId = req.params.id
    const cartItems = req.user.cartItems
    const user = req.user
    try {
        const updatedCartItems = cartItems.filter((item) => item.product !== productId)
        user.cartItems = updatedCartItems
        await user.save()
        res.json(user.cartItems)
    } catch (error) {
        console.log('Error in deleteCart controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const modifyCartItemQuantity = async (req, res) => {
    const productId = req.params.id
    const {updatedItem} = req.body
    const user = req.user
    const cartItems = user.cartItems
    try {
        user.cartItems = cartItems.map((item) => item.product == productId ? updatedItem : item)
        await user.save()
        res.json(user.cartItems)

    } catch (error) {
        console.log('Error in modifyCartItemQuantity controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    } 
}