import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { redis } from '../lib/redis.js'


const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId} , process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({userId} , process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })

    return {accessToken,refreshToken}
}

const redisTokenUpload = async(userId, token) => {
    try{
        await redis.set(`refreshToken:${userId}`, token, "EX", 7*24*60*60)
    }
    catch(error){
        console.log("Error in redis token upload");
    }
} 

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 27 * 7 * 60 * 60 * 1000
    })
}

export const toLogin = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password){
        return res.status(400).json({
            success: false,
            message: `email and password are required`
        })
    }
    try{
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({
            success: false,
            message: `No such user exists`
        })
        }
        if (user && (await user.comparePassword(password))){
            const {accessToken, refreshToken} = generateTokens(user._id)
            await redisTokenUpload(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)
            res.status(201).json({
                success: true, message: "Logged in successfully", body: {
                    name: user.name,
                    email: user.email
                }
            })
        }
        else{
            return res.status(401).json({
            success: false,
            message: `Invalid credentials`
        })
        }
    }
    catch(error){
        console.log("Error in login in controller");
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message}`
        })
    }
}

export const toSignup = async (req, res) => {

    const { name, email, password} = req.body

    try{

        if (!name || !email || !password){
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }

        const userExists = await User.findOne({email})
        if (userExists){
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }
        const user = await User.create({name, password, email})

        const {accessToken, refreshToken} = generateTokens(user._id)
        await redisTokenUpload(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            body: {
                name: user.name,
                email: user.email
            }
        })
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const toLogout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken){
        const decodedId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET).userId
        try{
            const result = await redis.del(`refreshToken:${decodedId}`)
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            res.json({success: true, message: "Logged out successfully"})
        }
        catch(error){
            res.json({success: false, message: 'Internal Server Error'})
        }
    }
    else {
       return res.status(401).json({success: false, message: 'Unauthorized request'})
    }
}

export const toRefresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken){
        return res.status(401).json({
            message: 'No refresh token provided'
        })
    }
    try{
        const decodedId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET).userId
        const tokenFromRedis = await redis.get(`refreshToken:${decodedId}`)
        if (refreshToken !== tokenFromRedis){
            return res.status(401).json({
            message: 'Invalid refresh token'
        })
        }
        const newAccessToken = jwt.sign({decodedId}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        })
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })
        res.status(201).json({
            success: true,
            message: 'Access token refresh is successfull'
        })
    }
    catch(error){
        console.log('Error in refresh token controller', error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}