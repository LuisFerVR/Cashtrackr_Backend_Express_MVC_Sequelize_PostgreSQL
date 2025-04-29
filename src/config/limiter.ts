import {rateLimit} from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 1000 * 60,
    max : process.env.NODE_ENV === 'production'? 5 : 100,
    message: 'Haz llegado al máximo de intentos, intente nuevamente en 1 minuto',
})