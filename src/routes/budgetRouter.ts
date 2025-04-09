import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { validateBudgetExists, validateBudgetId, validateBudgetInputs } from "../middleware/Budget";
import { ExpensesController } from "../controllers/ExpenseController";
const router = Router();

router.param('budgetId',validateBudgetId);
router.param('budgetId',validateBudgetExists);

router.get("/", BudgetController.getAll);

router.post("/",
    validateBudgetInputs
    ,handleInputErrors
    ,BudgetController.create
);

router.get('/:budgetId',BudgetController.getById);

router.put('/:budgetId',
    validateBudgetInputs
    ,handleInputErrors
    ,BudgetController.updateById
);

router.delete('/:budgetId',BudgetController.deleteById);

//Router para gastos
router.get('/:budgetId/expenses',ExpensesController.getAll);
router.post('/:budgetId/expenses',ExpensesController.create);
router.get('/:budgetId/expenses/:expenseId',ExpensesController.getById);
router.put('/:budgetId/expenses/:expenseId',ExpensesController.updateById);
router.delete('/:budgetId/expenses/:expenseId',ExpensesController.deleteById);

export default router;