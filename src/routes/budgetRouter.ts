import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { validateBudgetExists, validateBudgetId, validateBudgetInputs } from "../middleware/Budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { validateExpenseExists, validateExpenseId, validateExpenseInputs } from "../middleware/expense";
const router = Router();

router.param('budgetId',validateBudgetId);
router.param('budgetId',validateBudgetExists);

router.param('expenseId',validateExpenseId);
router.param('expenseId',validateExpenseExists);

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
router.post('/:budgetId/expenses',
    validateExpenseInputs,
    handleInputErrors,
    ExpensesController.create
);
router.get('/:budgetId/expenses/:expenseId',ExpensesController.getById);
router.put('/:budgetId/expenses/:expenseId',
    validateExpenseInputs,
    handleInputErrors,
    ExpensesController.updateById
);
router.delete('/:budgetId/expenses/:expenseId',ExpensesController.deleteById);

export default router;