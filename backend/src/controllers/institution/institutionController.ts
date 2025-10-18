import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertInstitution, getAllInstitutions, getInstitutionById, getInstitutionByProfessorId } from "../../services/institutionService";
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

export async function findInstitutionById(req: Request, res: Response) {
    try{
        const {id} = req.params;
        if (!id){
            throw new Error('Params must contain "id" field');
        }

        const institution = await getInstitutionById(id);

        return res.json({
            message: 'Institution Found',
            data: institution
        });

    }  catch (err: any){
        const msg: string = err.message;
        res.json({
            error: msg
        });
    }
    
}

export async function findInstitutionByProfessorId(req: Request, res: Response) {
    try{
        const {id} = req.params;
        if (!id){
            throw new Error('Params must contain "id" field');
        }

        const institution = await getInstitutionByProfessorId(id);

        return res.json({
            message: 'Institutions Found',
            data: institution
        });

    }  catch (err: any){
        const msg: string = err.message;
        res.json({
            error: msg
        });
    }
    
}