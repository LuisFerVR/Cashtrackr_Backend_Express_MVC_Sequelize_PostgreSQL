import {rateLimit} from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 1000 * 60,
    max : 5,
    message: 'Haz llegado al máximo de intentos, intente nuevamemte en 1 minuto',
})