import { BudgetController } from "../../controllers/BudgetController"
import Budget from "../../models/Budget"
import { budgets } from "../mocks/Budget"
import {createRequest,createResponse} from "node-mocks-http"

jest.mock("../../models/Budget",() => ({
    findAll: jest.fn()
}))

describe("BudgetController.getAll", () => {
beforeEach(()=>{
    (Budget.findAll as jest.Mock).mockReset();
    (Budget.findAll as jest.Mock).mockImplementation((options)=> {
        const updateBudgets = budgets.filter(budget => budget.userId === options.where.userId);
        return Promise.resolve(updateBudgets);
    })
})

    it("should retrive 2 budgets for user with id 1",async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: {id:1}
        })
        const res = createResponse();
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
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
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
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
        await BudgetController.getAll(req,res);

        const data = res._getJSONData()
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('should handle errors when fetching budgets', async ()=> {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: {id:1}
        })

        const res = createResponse();
        (Budget.findAll as jest.Mock).mockRejectedValue(Error)

        await BudgetController.getAll(req,res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({error:"Hubo un error al obtener los presupuestos"})
    })
})