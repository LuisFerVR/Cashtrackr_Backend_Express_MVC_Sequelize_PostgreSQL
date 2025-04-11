import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmails } from '../emails/AuthEmails';

export class AuthController {
    static createAccount = async(req:Request, res:Response) => {

        const { email, password } = req.body;
        
        //prevenir duplicados
        const userExist = await User.findOne({ where: {email}})
        if(userExist) {
            const error = new Error('El correo electrónico ya está en uso')
            res.status(409).json({ error: error.message })
            return
        }

        try {

            const user = new User(req.body);
            user.password= await hashPassword(password);
            user.token = generateToken();
            await user.save();

            await AuthEmails.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Usuario creado correctamente');
        } catch (error) {
            console.log( error);
            

            res.status(500).json({ error: 'Error en el servidor al crear su cuenta' })

        }
    }

    static confirmAccount = async(req:Request, res:Response) => {
        
        try {
            
            const {token} = req.body;
            const user = await User.findOne({ where: { token }});

            console.log(token,user);
    
            if(!user){
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }
    
            user.confirmed = true;
            user.token = null;
            await user.save();
            res.json({user});

        } catch (e) {
            console.log(e);
            const error = new Error('Error al confirmar la cuenta')
            res.status(500).json({ error: error.message })
        }
    }
}