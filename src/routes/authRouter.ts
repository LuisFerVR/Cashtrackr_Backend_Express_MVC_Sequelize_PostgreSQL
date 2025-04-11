import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";

const router = Router();
router.use(limiter);

router.post('/create-acount',
    body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').notEmpty().isEmail().withMessage('El correo electrónico no es válido'),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    body('token').notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('El token no es válido'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('login',
    body('emali')
        .isEmail()
        .withMessage('Correo inválido') ,
    body('password').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    AuthController.login
)

export default router;