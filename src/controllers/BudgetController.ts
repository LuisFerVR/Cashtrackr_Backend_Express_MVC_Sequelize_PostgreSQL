import { Request, Response } from "express";
import Budget from "../models/Budget";

export class BudgetController {
    static getAll = async (req:Request, res:Response) => {
        console.log("desde GET /api/budgets");
    }

    static create = async (req:Request, res:Response) => {
        try {
            const budget = new Budget(req.body);
            await budget.save();
            res.status(201).json('Presupuesto creado correctamente');
        } catch (error) {
            //console.log("error",error);
            res.status(500).json({message:"Hubo un error al crear el presupuesto"});
        }
    }

    static getById = async (req:Request, res:Response) =>{
        console.log("desde GET /api/budgets/id");
    }

    static updateById = async (res:Request, req:Response) =>{
        console.log("desde PUT /api/budgets/id");
    }

    static deleteById = async (req:Request, res:Response) => {
        console.log("desde DELETE /api/budgets/id");
    }

}