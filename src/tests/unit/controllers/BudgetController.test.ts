import { BudgetController } from "../../../controllers/BudgetController"
import Budget from "../../../models/Budget"
import Expense from "../../../models/Expense"
import { budgets } from "../../mocks/Budget"
import {createRequest,createResponse} from "node-mocks-http"

jest.mock("../../../models/Budget",() => ({
    findAll: jest.fn(),
    create:jest.fn(),
    findByPk: jest.fn(),
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

describe("BudgetController.create", () => {
    it("should create a new budget and response with statuscode 201", async () => {

        const mockBudget = {
            save: jest.fn().mockResolvedValue(true),
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);

        
        const req = createRequest({
            method:"POST",
            url:"/api/budgets",
            user: {id:1},
            body:{
                name:"Test Budget",
                amount:1000,
                userId:1
            }
        })

        const res = createResponse();

        await BudgetController.create(req,res);

        const data = res._getJSONData();
        
        expect(res.statusCode).toBe(201);
        expect(data).toEqual("Presupuesto creado correctamente")
        expect(mockBudget.save).toHaveBeenCalled();
        expect(mockBudget.save).toHaveBeenCalledTimes(1);
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    })

    it("should handle budget creation error", async () => {
    
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true),
        };
        (Budget.create as jest.Mock).mockRejectedValue(new Error);
    
        
        const req = createRequest({
            method:"POST",
            url:"/api/budgets",
            user: {id:1},
            body:{
                name:"Test Budget",
                amount:1000,
                userId:1
            }
        })
    
        const res = createResponse();
    
        await BudgetController.create(req,res);
    
        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data.message).toEqual("Hubo un error al crear el presupuesto");
        expect(mockBudget.save).not.toHaveBeenCalled();
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    })
})

describe('BudgetController.getById', () => {
    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockImplementation(id=> {
            const budget = budgets.filter(b => b.id === id)[0];
            return Promise.resolve(budget);
        })
    })

    it('should return a budget with id 1 and 3 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget:{ id: 1}
        })

        const res = createResponse();
        await BudgetController.getById(req,res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data.expenses).toHaveLength(3);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledTimes(1);
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense]
        })

    })

    it('should return a budget with id 2 and 2 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget:{ id: 2}
        })

        const res = createResponse();
        await BudgetController.getById(req,res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data.expenses).toHaveLength(2);
    })

    it('should return a budget with id 3 and 0 expenses', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget:{ id: 3}
        })

        const res = createResponse();
        await BudgetController.getById(req,res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data.expenses).toHaveLength(0);
    })
})

describe('BudgetController.updateById', () => {
    it('should update the budgetand return a success message', async () => {
        const budgetMock = {
            update:jest.fn().mockResolvedValue(true),
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget:budgetMock,
            body:{name:'presupuesto actualizado', amount:2000}
        })

        const res = createResponse();
        await BudgetController.updateById(req,res);
        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data).toBe('Presupuesto actualizado correctamente');
        expect(budgetMock.update).toHaveBeenCalledTimes(1);
        expect(budgetMock.update).toHaveBeenCalledWith(req.body);
    })
})

describe('BudgetController.deleteById', () => {
    it('should delete a budget with id 1', async () => {
        const budgetMock = {
            destroy:jest.fn().mockResolvedValue(true),
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget:budgetMock
        })

        const res = createResponse();
        await BudgetController.deleteById(req,res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data).toBe('Presupuesto eliminado correctamente');
        expect(budgetMock.destroy).toHaveBeenCalledTimes(1);
    })
})