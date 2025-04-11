import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post('/create-acount',
    body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').notEmpty().isEmail().withMessage('El correo electrónico no es válido'),
    handleInputErrors,
    AuthController.createAccount
);

export default router;