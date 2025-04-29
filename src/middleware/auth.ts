import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user ?: User
        }
    }
}

export const autenticate = async (req:Request, res:Response, next: NextFunction) => {
    const bearer = req.headers.authorization;

        if(!bearer) {
            const error = new Error('No autorizado');
            res.status(401).json({ error: error.message });

        }

        const [,token] = bearer.split(' ');
        if(!token){
            const error = new Error('Token inválido');
            res.status(401).json({ error: error.message });
        }

        try {
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            if(!decoded){
                const error = new Error('Token inválido');
                res.status(401).json({ error: error.message });
            }

            if( typeof decoded === 'object' && decoded.id){
                const infoUser = await User.findByPk(decoded.id, {
                    attributes: ['id', 'name', 'email'],
                });

                req.user = infoUser;
                next();
            }

        } catch (e) {
            const error = new Error('Token inválido');
            res.status(401).json({ error: error.message });
        }
}