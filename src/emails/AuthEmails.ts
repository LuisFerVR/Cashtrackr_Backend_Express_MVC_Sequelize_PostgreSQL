import { transport } from "../config/nodemailer"
import User from "../models/User";

type EmailType = {
    name:string,
    email:string,
    token:string,
}

export class AuthEmails {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from : 'CashTracker <admin@cashtrackr.com> ',
            to: user.email,
            subject: 'Confirma tu cuenta en CashTracker',
            html:`
            <p>Hola ${user.name},has creado tu cuenta cashtrackr</p>
            <p>Visita el siguiente enlace:</p>
            <a href="#">Confirmar tu cuenta</a>
            <p>E ingresa el siguiente código:<b>${user.token}</b></p>
            `
        })

        console.log('Email sent: %s', email.messageId);
        
    }

    static sendPasswordResetToken = async (user:EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTracker <admin@cashtrackr.com>',
            to: user.email,
            subject: 'Reestablece tu contraseña en CashTracker',
            html : `
                <p>Hola ${user.name},has solicitado restablecer tu contraseña cashtrackr</p>
                <p>Visita el siguiente enlace:</p>
                <a href="#">Restablecer tu cuenta</a>
                <p>E ingresa el siguiente código:<b>${user.token}</b></p>
            `
        })
        console.log('token de reestablecimiento de contraseña enviado: %s', email.messageId);
        
    }
}