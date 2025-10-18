import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertInstitution, getAllInstitutions } from "../../services/institutionService";
import { getLoggedUser } from "../../services/auth";


export async function createInstitution(req:Request, res: Response) {
    try{
        if (req.body.name === undefined){
            throw new Error("Property 'name' cannot be null.");
        }

        const data = req.body as InstitutionRegisterRequestDTO;
  
        const professor = getLoggedUser(req);
        if (!professor){
            throw new Error('User is not authenticated.');
        }
        const institution: InstitutionResponseDTO = await insertInstitution(data, professor.id);

        
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

export async function findAllInstitutions(res: Response) {
    return res.json({
        message: 'All institutions are found.',
        data: await getAllInstitutions()
    });
}