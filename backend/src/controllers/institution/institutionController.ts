import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertInstitution, getAllInstitutions, getInstitutionById, getInstitutionByProfessorId, insertProfessorInInstitution, updateInstitution } from "../../services/institutionService";
import { getLoggedUser } from "../../services/auth";
import { AppError } from '../../errors/AppError';

export async function createInstitution(req:Request, res: Response) {
    const {body} = req;
    try{
        if (!body || !body.name){
            throw new AppError(400, "Property 'name' cannot be null.");
        }

        const data = body as InstitutionRegisterRequestDTO;
  
        const professor = getLoggedUser(req);
        if (!professor){
            throw new AppError(401, 'User is not authenticated.');
        }
        const institution: InstitutionResponseDTO = await insertInstitution(data, professor.id);

        
        return res.json({
            message: 'Institution was created successfully.',
            data: institution
        });

    } catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
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
            throw new AppError(400, 'Params must contain "id" field');
        }

        const institution = await getInstitutionById(id);

        return res.json({
            message: 'Institution Found',
            data: institution
        });

    }  catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
    
}

export async function findInstitutionByProfessorId(req: Request, res: Response) {
    try{
        const {id} = req.params;
        if (!id){
            throw new AppError(400, 'Params must contain "id" field');
        }

        const institution = await getInstitutionByProfessorId(id);

        return res.json({
            message: 'Institutions Found',
            data: institution
        });

    } catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
    
}

export async function relateProfessorWithInstitution(req: Request, res: Response) {
    try{
            const { body } = req;

            if (!body || body.professorId === undefined) {
                throw new AppError(400, "Property 'professorId' cannot be null.");
            }

            if (body.institutionId === undefined) {
                throw new AppError(400, "Property 'institutionId' cannot be null.");
            }

            const {professorId, institutionId} = body;
    
            const institution: InstitutionResponseDTO = await insertProfessorInInstitution(professorId, institutionId);

            return res.json({
                message: 'Relationship between professor and institution was created successfully.',
                data: institution
            });

    } catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
}

export async function putInstitution(req: Request, res: Response) {
    try{
        const {params, body} = req;
    
        if (!params.id){
            throw new AppError(404, 'Institution ID not found.');            
        }

        if (!body){
            throw new AppError(400, 'Body must contain data to continue.');
        }

        const updatedInstitution = await updateInstitution(params.id, body);

        return res.json({
            message: 'Institution updated',
            data: updatedInstitution
        });

    } catch(err: any) {
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
    
}