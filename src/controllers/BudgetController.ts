import { Request, Response } from "express";
import Budget from "../models/Budget";
import Expense from "../models/Expense";

export class BudgetController {
    static getAll = async (req:Request, res:Response) => {
        try {
            const budgets = await Budget.findAll({
                order:[
                    ['createdAt', 'DESC']
                ]
                //TODO: Flitrar por el usuario logueado
            });
            res.status(200).json(budgets);
        } catch (error) {
            res.status(500).json({message:"Hubo un error al obtener los presupuestos"});
        }
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
        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense]
        })
        res.status(200).json(budget);
    }

    static updateById = async (req:Request, res:Response) =>{
        await req.budget.update(req.body);
        res.status(200).json('Presupuesto actualizado correctamente');
    }

    static deleteById = async (req:Request, res:Response) => {
        await req.budget.destroy();
        res.status(200).json('Presupuesto eliminado correctamente');
    }

}