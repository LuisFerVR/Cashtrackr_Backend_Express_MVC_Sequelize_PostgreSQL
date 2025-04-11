import Jwt from "jsonwebtoken";

export const generateJWT = (id: string) => {
    const token = Jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
    return token
    
}
