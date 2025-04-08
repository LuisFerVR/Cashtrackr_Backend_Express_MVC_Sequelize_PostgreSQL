import { NextFunction,Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";

declare global {
    namespace Express {
        interface Request {
            budget?: Budget;
        }
    }
}

export const validateBudgetId = async (req:Request, res:Response,next: NextFunction) =>{
    await param('id').isInt().withMessage("Id inválido").custom(id => id > 0).withMessage("Id inválido").run(req);

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next();
}

export const validateBudgetExists = async (req:Request, res:Response,next: NextFunction) =>{
    try {
        const {id} = req.params;
        const budget = await Budget.findByPk(id);

        if(!budget) {
            res.status(404).json({message:`No se encontro el presupuesto con id: ${id}`});
        }

        req.budget = budget;

        next();
        
    } catch (e) {
        const error = new Error("Hubo un error al obtener el presupuesto");
        res.status(500).json({message:error.message});
    }
}

export const validateBudgetInputs = async (req:Request, res:Response,next: NextFunction) =>{
    try {
        await body("name")
            .notEmpty()
            .withMessage("El nombre del presupuesto no puede ir vacio").run(req);
            
        await body("amount")
            .notEmpty()
            .withMessage("La cantidad del presupuesto no puede ir vacio")
            .isNumeric().withMessage("La cantidad del presupuesto debe ser un numero")
            .custom(amount => amount > 0).withMessage("La cantidad del presupuesto debe ser mayor a 0").run(req);
        
            next();
        
    } catch (e) {
        const error = new Error("Hubo un error al obtener el presupuesto");
        res.status(500).json({message:error.message});
    }
}