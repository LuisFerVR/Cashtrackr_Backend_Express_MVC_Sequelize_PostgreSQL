import { BudgetController } from "../../controllers/BudgetController"
import Budget from "../../models/Budget"
import { budgets } from "../mocks/Budget"
import {createRequest,createResponse} from "node-mocks-http"

jest.mock("../../models/Budget",() => ({
    findAll: jest.fn()
}))

describe("BudgetController.getAll", () => {
    it("should retrive 2 budgets for user with id 1",async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: {id:1}
        })
        const res = createResponse();
        const updatedBudgets = budgets.filter(budget => budget.userId === req.user.id);
        (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets)
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
        console.log(data);
        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it("should retrive 1 budgets for user with id 2",async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: {id:2}
        })
        const res = createResponse();
        const updatedBudgets = budgets.filter(budget => budget.userId === req.user.id);
        (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets)
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
        console.log(data);
        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it("should retrive 0 budgets for user with id 100",async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: {id:100}
        })
        const res = createResponse();
        const updatedBudgets = budgets.filter(budget => budget.userId === req.user.id);
        (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets)
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
        console.log(data);
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
})