//Autor: Emilly Morelatto
import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import{uptadeScoreService, 
    listScoreService, 
    defineFormulaService, 
    calculateFinalGradesService} from "../services/scoreService";

export async function uptadeScoreController(req: Request, res: Response) {
    try {
        const {class_id, componentId}=req.params;
        const notas=req.body;

        const result= await uptadeScoreService(class_id, componentId, notas);

        res.status(200).json({message: 'Grades successfully submitted', data:result});
    }catch(err: any) {
        console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
    }
}
export async function listGrades(req: Request, res: Response) {
    try {
        const{class_id}=req.params;

        const result =await listScoreService(class_id);
        res.status(200).json({message: 'The grades were listed successfully', data:result});

    }catch(err: any) {
        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
}
export async function defineFormula(req: Request, res: Response) {
    try {
        const{subject_id}=req.params;
        const formula=req.body;

        const result= await defineFormulaService(subject_id, req.body);
        res.status(200).json({message:'Formula was defined succesfully', data:result});
    }catch(err:any) {
        console.error(err);
        return res.status(500).json({ error:' Unexpected Error'});
    }
}
export async function calculateFinalGrades(req: Request, res: Response) {
    try {
        const {class_id}=req.params;

        const result= await calculateFinalGradesService(class_id);
        res.status(500).json({message: 'Final Grades was succesfully calculate', data:result});
    }catch(err:any) {
        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});

    }
}