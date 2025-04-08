import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { validateBudgetExists, validateBudgetId, validateBudgetInputs } from "../middleware/Budget";
const router = Router();

router.param('id',validateBudgetId);
router.param('id',validateBudgetExists);

router.get("/", BudgetController.getAll);

router.post("/",
    validateBudgetInputs
    ,handleInputErrors
    ,BudgetController.create
);

router.get('/:id',BudgetController.getById);

router.put('/:id',
    validateBudgetInputs
    ,handleInputErrors
    ,BudgetController.updateById
);

router.delete('/:id',BudgetController.deleteById);

export default router;