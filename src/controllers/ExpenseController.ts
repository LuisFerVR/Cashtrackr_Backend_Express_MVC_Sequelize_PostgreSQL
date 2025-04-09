import type { Request, Response } from 'express'
import Expense from '../models/Expense';
import Budget from '../models/Budget';

export class ExpensesController {
  
    static create = async (req: Request, res: Response) => {
       try {
            const expense = new Expense(req.body);
            expense.budgetId = req.budget.id;
            await expense.save();
            res.status(201).json("Gasto Agregado Correctamente");
       } catch (error) {
            console.error("Error al crear gasto:", error);
            res.status(500).json({ message: "Error al crear gasto" });
       }
    }
  
    static getById = async (req: Request, res: Response) => {
        res.json(req.expense);
        
    }

    static updateById = async (req: Request, res: Response) => {
        await req.expense.update(req.body);
        res.status(200).json("Gasto Actualizado Correctamente");
    }
  
    static deleteById = async (req: Request, res: Response) => {
        await req.expense.destroy();
        res.status(200).json("Gasto Eliminado Correctamente");
    }
}