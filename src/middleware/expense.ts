import { Request, Response, NextFunction, request } from "express";
import { body, param, validationResult } from "express-validator";
import Expense from "../models/Expense";

declare global {
    namespace Express {
        interface  Request {
            expense?: Expense;
        }
    }
}

export const validateExpenseInputs = async (req:Request, res:Response,next: NextFunction) =>{
    await body("name")
        .notEmpty()
        .withMessage("El nombre del gasto no puede ir vacio").run(req);
        
    await body("amount")
        .notEmpty()
        .withMessage("La cantidad del gasto no puede ir vacio")
        .isNumeric().withMessage("La cantidad del gasto debe ser un número")
        .custom(amount => amount > 0).withMessage("La cantidad del gasto debe ser mayor a 0").run(req);
    
    next();
}

export const validateExpenseId = async (req:Request, res:Response,next: NextFunction) =>{
    await param('expenseId').isInt().custom(id => id > 0).withMessage("expenseId inválido").run(req);
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateExpenseExists = async (req:Request, res:Response,next: NextFunction) =>{
    try {
        const {expenseId} = req.params;
        const expense = await Expense.findByPk(expenseId);

        if(!expense) {
            const error = new Error(`No se encontró el gasto con expenseId: ${expenseId}`);
            return res.status(404).json({message: error.message});
        }

        req.expense = expense;

        next();
        
    } catch (e) {
        const error = new Error("Hubo un error al obtener los gastos del presupuesto");
        res.status(500).json({message:error.message});
    }
}