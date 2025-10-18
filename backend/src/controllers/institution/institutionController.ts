import { InstitutionRegisterRequestDTO, InstitutionResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertInstitution } from "../../services/institutionService";

export async function createInstitution(req:Request, res: Response) {
    try{
        if (req.body.name === undefined){
            throw new Error("Property 'name' cannot be null.");
        }

        const data = req.body as InstitutionRegisterRequestDTO;
  
    
        const institution: InstitutionResponseDTO = await insertInstitution(data);
        res.json({
            message: 'Institution was created successfully.',
            data: institution
        });
    } catch (err: any){
        const msg: string = err.message;
        res.json({
            error: msg
        });
    }
    
}