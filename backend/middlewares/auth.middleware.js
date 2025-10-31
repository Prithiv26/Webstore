import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const userAuth = async (req, res, next) => {
    const accessToken = req.cookies.accessToken
    if (!accessToken){
        return res.status(401).json({
            message: 'Access token not provided'
        })
    }
    try {
        const decodedId =  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET).userId
        const user = await User.findById(decodedId).select("-password")
        if (!user){
            return res.status(401).json({
            message: 'No User found'
        })
        }

        req.user = user
        next()
    } catch (error) {
        console.log("Error in userAuth", error);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

export const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin'){
       next()
    }
    else{
         return res.status(403).json({
            message: 'Unauthorized - admin only'
        })
    }
}

