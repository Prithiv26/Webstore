import { response } from 'express';
import Coupon from '../models/coupon.model.js'

export const getCoupon = async (req, res) => {
    const user = req.user;
    try {
        const coupon = await Coupon.findOne({userId: user._id, isActive: true});
        if (!coupon){
            return res.status(404).json({
                success: false,
                message: 'No coupon found'
            })
        }
        res.json({
            success: true,
            coupon: coupon
        })
    } catch (error) {
        console.log('Error in getCoupon controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
        
    }
}

export const validateCoupon = async (req, res) => {
    const {code} = req.body;
    try {
        const coupon = await Coupon.findOne({code: code, userId: req.user._id, isActive: true});
        if (!coupon){
            return res.status(404).json({
                success: false,
                message: 'No Coupon found'
            })
        }
        if (coupon.expirationDate < new Date()){
            coupon.isActive = false
            await coupon.save()
            return response.status(404).json({
                success: false,
                message: 'Coupon expired!'
            })
        }
        res.json({
            message: 'Coupon is Valid',
            success: true,
            coupon: {
                code,
                discountPercentage: coupon.discountPercentage
            }
        })
    } catch (error) {
        console.log('Error in validateCoupon controller', error.message);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}