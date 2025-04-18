import { createRequest, createResponse } from "node-mocks-http"
import { validateBudgetExists } from "../../../middleware/Budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/Budget";
import { hasAcces as hasAccess } from "../../../middleware/Budget";

jest.mock('../../../models/Budget.ts', () => ({
    findByPk: jest.fn(),
}))

describe('budget middleware - validateBudgetExists', () => {
    it('should handle non-existen budget', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);
        const req = createRequest({
            params:{
                budgetId:1
            }
        })
        const res = createResponse();
        const next = jest.fn();

        await validateBudgetExists(req,res,next);
        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({message:`No se encontro el presupuesto con budgetId: ${req.params.budgetId}`});
        expect(next).not.toHaveBeenCalled();
    })

    it('should handle non-existen budget', async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);
        const req = createRequest({
            params:{
                budgetId:1
            }
        })

        const res = createResponse();
        const next = jest.fn();

        await validateBudgetExists(req,res,next);
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({message:`Hubo un error al obtener el presupuesto`});
        expect(next).not.toHaveBeenCalled();
    })

    it('should procced to next middleware if budget exist',async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);
        const req = createRequest({
            params:{
                budgetId:1
            }
        })
        const res = createResponse();
        const next = jest.fn();

        await validateBudgetExists(req,res,next);
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.budget).toEqual(budgets[0]);
    })
})

describe ('budget middleware - has Access', () => {
    it('should call next() if user has access to budget', () => {
        const req = createRequest({
            budget:budgets[0],
            user:{
                id:1
            }
        })
        const res = createResponse();
        const next = jest.fn();

        hasAccess(req,res,next);
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);

    })

    it('should return 403 error if userId not have access to budget', () => {
        const req = createRequest({
            budget:budgets[0],
            user:{
                id:2
            }
        })
        const res = createResponse();
        const next = jest.fn();

        hasAccess(req,res,next);
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toEqual({message:"Acción no válida"});
    })
})