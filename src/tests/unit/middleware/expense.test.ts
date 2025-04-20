import { createRequest, createResponse } from "node-mocks-http";
import { validateExpenseExists } from "../../../middleware/expense";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/expenses";
import { hasAcces } from "../../../middleware/budget";
import { budgets } from "../../mocks/Budget";
jest.mock("../../../models/Expense", () => ({
    findByPk: jest.fn(),
}));

describe("Expenses Middleware - validateExpenseExists", () => {
    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation((id) => {
            const expense = expenses.filter( e => e.id === id)[0] ?? null;
            return Promise.resolve(expense);
        });
    })

    it("should handle a non-existe budget", async () => {

        const req = createRequest({
            params: {expenseId: 120},
        });

        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({message:`No se encontró el gasto con expenseId: ${req.params.expenseId}`});
        expect(next).not.toHaveBeenCalled();
    })

    it("should call next middleware if expense exists", async () => {

        const req = createRequest({
            params: {expenseId: 1},
        });

        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.expense).toEqual(expenses[0]);
    })

    it("should handle internal server error", async () => {

        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            params: {expenseId: 1},
        });

        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({message:`Hubo un error al obtener los gastos del presupuesto`});
    })

    it('should prevent unauthorized users from adding expenses', async () => {
        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            budget: budgets[0],
            user:{id:20},
            body: {
                name: "Test Expense",
                amount: 100,
            },
        })
        const res = createResponse();
        const next = jest.fn();

        hasAcces(req, res, next);
        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toEqual({message:"Acción no válida"});
        expect(next).not.toHaveBeenCalled();
    })

})