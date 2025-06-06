import { Request, Response } from 'express';
import User from '../models/User';
import { comparePassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmails } from '../emails/AuthEmails';
import { generateJWT } from '../utils/jwt';
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

            const user = await User.create(req.body);
            user.password= await hashPassword(password);
            const token = generateToken();
            user.token = token;

            if(process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackrConfirmationToken = token;
            }

            await user.save();

            await AuthEmails.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Usuario creado correctamente');
            return
        } catch (error) {
            console.log(error);
            
            res.status(500).json({ error: 'Error en el servidor al crear su cuenta' })
            return
        }
    }

    static confirmAccount = async(req:Request, res:Response) => {
        
        try {
            
            const {token} = req.body;
            const user = await User.findOne({ where: { token }});

            if(!user){
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }
    
            user.confirmed = true;
            user.token = null;
            await user.save();
            res.json("Cuenta confirmada correctamente, ya puede iniciar sesión");

        } catch (e) {
            console.log(e);
            const error = new Error('Error al confirmar la cuenta')
            res.status(500).json({ error: error.message })
        }
    }

    static login = async (req:Request, res:Response) => {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({where: {email}});

            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if (!user.confirmed) {
                const error = new Error('La cuenta no ha sido confirmada')
                res.status(403).json({ error: error.message })
                return
            }

            const isPasswordCorrect = await comparePassword(password, user.password);

            if(!isPasswordCorrect){
                const error = new Error('Contraseña incorrecta')
                res.status(403).json({ error: error.message })
                return
            }
            const token = generateJWT(user.id);
            
            res.json(token);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error en el servidor al iniciar sesión' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            const user = await User.findOne({where: {email}});
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            user.token = generateToken();
            await user.save();

            await AuthEmails.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: user.token
            });

            res.json('Correo de restablecimiento de contraseña enviado, revise su bandeja de entrada o spam');
        } catch (e) {
            console.log(e);
            const error = new Error('Error al enviar el correo de restablecimiento de contraseña')
            res.status(500).json({ error: error.message })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.body;
            const tokenExist = await User.findOne({where: {token}});

            if(!tokenExist){
                const error = new Error('Token no encontrado')
                res.status(404).json({ error: error.message })
                return;
            }

            res.json('Token válido, puede restablecer su contraseña');
            
        } catch (e) {
            console.log(e);
            const error = new Error('Error al validar el token')
            res.status(500).json({ error: error.message })
        }
    }

    static resetPasswordWithToken = async (req:Request, res:Response) => {
        const {token} = req.params;
        const {password} = req.body;
        try {
            const user = await User.findOne({where: {token}});
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            user.password = await hashPassword(password);
            user.token = '';
            await user.save();
            res.json('Contraseña restablecida correctamente, ya puede iniciar sesión');
            
        } catch (e) {
            console.log(e);
            const error = new Error('Error al restablecer la contraseña')
            res.status(500).json({ error: error.message })
        }
    }

    static user = (req:Request, res:Response) => {
        res.json(req.user);
    }

    static updateCurrentUserPassword = async (req:Request, res:Response) => {
        const {current_password, password} = req.body;
        const {id} = req.user;
        const user = await User.findByPk(id);
        
        const isPasswordCorrect = await comparePassword(current_password, user.password);

        if(!isPasswordCorrect){
            const error = new Error('Contraseña incorrecta')
            res.status(403).json({ error: error.message })
            return
        }

        user.password = await hashPassword(password);
        await user.save();
        res.json('Contraseña actualizada correctamente');
    }

    static checkPassword = async (req:Request, res:Response) => {
        const { password } = req.body;
        const {id} = req.user;
        const user = await User.findByPk(id);
        
        const isPasswordCorrect = await comparePassword(password, user.password);

        if(!isPasswordCorrect){
            const error = new Error('Contraseña incorrecta, intente nuevamente con otra contraseña')
            res.status(403).json({ error: error.message })
            return
        }

        res.json('Contraseña correcta');
    }

    static updateUser = async (req:Request, res:Response) => {
        const {name, email} = req.body;
        try {
            const existingUser = await User.findOne({ where: { email } });

            if(existingUser && existingUser.id !== req.user.id) {
                const error = new Error('El correo electrónico ya está en uso')
                res.status(409).json({ error: error.message })
                return
            }

            await User.update({email,name}, {
                where: {
                    id: req.user.id
                }
            })

            res.json('Perfil actualizado correctamente');
        } catch (error) {
            const err = new Error('Error al actualizar el usuario')
            res.status(500).json({ error: err.message })
            return
        }
    }
}