import { redis } from '../lib/redis.js';
import Product from '../models/product.model.js'
import cloudinary from '../lib/cloudinary.js';

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

