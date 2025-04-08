import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
const router = Router();

router.get("/", BudgetController.getAll);

router.post("/",
    body("name")
        .notEmpty()
        .withMessage("El nombre del presupuesto no puede ir vacio"),
    body("amount")
        .notEmpty()
        .withMessage("La cantidad del presupuesto no puede ir vacio")
        .isNumeric().withMessage("La cantidad del presupuesto debe ser un numero")
        .custom(amount => amount > 0).withMessage("La cantidad del presupuesto debe ser mayor a 0")
    ,handleInputErrors
    ,BudgetController.create
);

router.get('/:id',
    param('id')
        .isInt()
        .withMessage("Id inválido")
        .custom(id => id > 0)
        .withMessage("Id inválido"),
    handleInputErrors,
    BudgetController.getById
);

router.put('/:id',
    param('id')
        .isInt()
        .withMessage("Id inválido")
        .custom(id => id > 0)
        .withMessage("Id inválido"),
    body("name")
        .notEmpty()
        .withMessage("El nombre del presupuesto no puede ir vacio"),
    body("amount")
        .notEmpty()
        .withMessage("La cantidad del presupuesto no puede ir vacio")
        .isNumeric().withMessage("La cantidad del presupuesto debe ser un numero")
        .custom(amount => amount > 0).withMessage("La cantidad del presupuesto debe ser mayor a 0")
    ,handleInputErrors
    ,BudgetController.updateById
);

router.delete('/:id',
    param('id')
        .isInt()
        .withMessage("Id inválido")
        .custom(id => id > 0)
        .withMessage("Id inválido"),
    handleInputErrors,
    BudgetController.deleteById);

export default router;