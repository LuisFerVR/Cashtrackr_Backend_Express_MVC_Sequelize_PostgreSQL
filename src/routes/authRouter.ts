import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { autenticate } from "../middleware/auth";

const router = Router();
router.use(limiter);

router.post('/create-acount',
    body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('El token no es válido'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail()
        .withMessage('Correo inválido') ,
    body('password').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password', 
    body('email')
        .isEmail()
        .withMessage('Correo inválido') ,
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token',
    body('token')
        .notEmpty()
        .isLength({min:5, max:6})
        .withMessage('El token no es válido'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .notEmpty()
        .isLength({min:6,max:6})
        .withMessage('El token no es válido'),
    body('password')
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user', autenticate, AuthController.user);

router.put('/user', autenticate, AuthController.updateUser);

router.post('/update-password',
    body('current_password')
        .notEmpty()
        .withMessage('La contraseña actual no puede estar vacía'),
    body('password')
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage('La contraseña nueva es muy corta, debe tener al menos 8 caracteres'),
    handleInputErrors,
    autenticate,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    body('password')
        .notEmpty()
        .withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    autenticate,
    AuthController.checkPassword
)

export default router;