import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'
export const isAuthenticated = async (req,res,next) =>{
    try {
        const token = req.cookies.token 
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const secret = process.env.jwt_secret || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret)
        req.user = await Customer.findById(decoded.userId)
        next()
    } catch (error) {
        res.status(500).json({ message: 'Server crashed' })
    }
}