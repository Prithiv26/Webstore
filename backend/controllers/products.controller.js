import { redis } from '../lib/redis.js';
import Product from '../models/product.model.js'
import cloudinary from '../lib/cloudinary.js';

async function updateFeaturedProductCache(){
    try {
        const updatedProducts = await Product.find({isFeatured: true}).lean()
        await redis.set('featuredProducts', JSON.stringify(updatedProducts))
    } catch (error) {
        console.log("Error in pdateFeaturedProductCache", error.message)
    }
}

export const getAllProducts = async (req,res) => {
    try{
        const products = await Product.find({})
        res.json(products)
    }
    catch(error){
        console.log('Error in getAllProducts controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        }) 
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featuredProducts")

        if (featuredProducts){
            return res.json(JSON.parse(featuredProducts))
        }
        featuredProducts = await Product.find({isFeatured: true}).lean()

        if (!featuredProducts){
            return res.status(404).json({message: 'No Featured Products available'})
        }

        await redis.set("featuredProducts", featuredProducts)

        res.json(featuredProducts)
        
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const createProduct = async (req,res) => {
    const {name, description, price, category, image} = req.body
    try {
        let cloudinaryResponse = null
        if (image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: 'products'})
        }
        const newProduct = await Product.create({
            name,
            description,
            category,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : ''
        })

        res.status(201).json(newProduct)
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product){
            return res.status(404).json({
                message: 'No Product found'
            })
        }
        if (product.image){
            let publicId = product.image.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(`products/${publicId}`)
        }

        await Product.findByIdAndDelete(req.params.id)
        res.status(201).json({
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const recommendedProducts = await Product.aggregate([
            {
                $sample: {size: 3}
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ])
        res.json(recommendedProducts)
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({category: req.params.category})
        if (!products){
            return res.status(404).json({
                message: 'No products found in category ${req.params.category}'
            })
        }
        res.json(products)
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        product.isFeatured = !product.isFeatured
        await product.save()
        await updateFeaturedProductCache()
        res.json(product)

    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}