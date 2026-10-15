import jwt from 'jsonwebtoken'
const gentoken=(userId)=>{
    const secret = process.env.jwt_secret || process.env.JWT_SECRET;
    return jwt.sign({userId}, secret, {expiresIn:'10d'})
}
export default gentoken