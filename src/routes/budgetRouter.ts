import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { hasAcces, validateBudgetExists, validateBudgetId, validateBudgetInputs } from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { belongsToBudget, validateExpenseExists, validateExpenseId, validateExpenseInputs } from "../middleware/expense";
import { autenticate } from "../middleware/auth";
const router = Router();

router.use(autenticate); //req.user

router.param('budgetId',validateBudgetId);
router.param('budgetId',validateBudgetExists); //req.budget

router.param('budgetId',hasAcces); //req.user, req.budget

router.param('expenseId',validateExpenseId);
router.param('expenseId',validateExpenseExists);
router.param('expenseId',belongsToBudget);

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