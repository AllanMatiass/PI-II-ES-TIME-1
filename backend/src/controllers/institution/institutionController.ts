// Autor: Allan Giovanni Matias Paes
// Controller de instituição

// NOTA: todos os catch's estão padronizados para reconhecer o tipo AppError lançado em algum momento do código, caso não seja, é um erro inesperado.
import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertInstitution, getAllInstitutions, getInstitutionById, getInstitutionByProfessorId, insertProfessorInInstitution, updateInstitution, deleteInstitution } from "../../services/institutionService";
import { getLoggedUser } from "../../services/auth";
import { AppError } from '../../errors/AppError';

// cria uma instituição
export async function createInstitution(req:Request, res: Response) {
    const {body} = req;
    try{
        // verifica se tem campo "name" no body
        if (!body || !body.name){
            throw new AppError(400, "Property 'name' cannot be null.");
        }

        // converte para um tipo customizado que contém apenas "name" como propriedade
        const data = body as InstitutionRegisterRequestDTO;
        
        // Pega o professor logado e vê se está autenticado (a verificação foi feita apenas para evitar do Typescript reclamar.)
        const professor = getLoggedUser(req);
        if (!professor){
            throw new AppError(401, 'User is not authenticated.');
        }

        // Faz a inserção via service
        const institution: InstitutionResponseDTO = await insertInstitution(data, professor.id);

        
        // Retorna um JSON com a instituição criada
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

// Apenas pega todas as instituições e professores relacionados
export async function findAllInstitutions(res: Response) {
    return res.json({
        message: 'All institutions are found.',
        data: await getAllInstitutions()
    });
}

// Encontra instituição por ID
export async function findInstitutionById(req: Request, res: Response) {
    try{
        // Verifica se ID foi passado como parâmetro
        const {id} = req.params;
        if (!id){
            throw new AppError(400, 'Params must contain "id" field');
        }

        // Faz o get via service.
        const institution = await getInstitutionById(id);

        // retorna informações daquela instituição
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

// Encontra as instituições de um certo professor pelo ID.
export async function findInstitutionByProfessorId(req: Request, res: Response) {
    try{
        // Verifica se tem ID nos parâmetros
        const {id} = req.params;
        if (!id){
            throw new AppError(400, 'Params must contain "id" field');
        }

        // Pega as instituições vinculadas à aquele professor
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

// Rota de "adicionar professor a uma instituição"
export async function relateProfessorWithInstitution(req: Request, res: Response) {
    try{
            // Verifica se existe professorId e instituitionId no body
            const { body } = req;

            if (!body || body.professorId === undefined) {
                throw new AppError(400, "Property 'professorId' cannot be null.");
            }

            if (body.institutionId === undefined) {
                throw new AppError(400, "Property 'institutionId' cannot be null.");
            }

            const {professorId, institutionId} = body;
            
            // Insere o professor naquela instituição via service
            const institution: InstitutionResponseDTO = await insertProfessorInInstitution(professorId, institutionId);

            // Se tudo ocorrer bem, retorna aquela instituição recém vinculada
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


// Atualiza uma instituição
export async function putInstitution(req: Request, res: Response) {
    try{
        // verifica se existe ID no params e um body na requisição.
        const {params, body} = req;
    
        if (!params.id){
            throw new AppError(404, 'Institution ID not found.');            
        }

        if (!body){
            throw new AppError(400, 'Body must contain data to continue.');
        }

        // Atualiza a instituição e retorna a instituição atualizada.
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

// Deleta uma instituição pelo ID
export async function delInstitution(req: Request, res: Response) {
    try{
        
        // verifica se tem ID no parâmetro
        const {params} = req;
    
        if (!params.id){
            throw new AppError(404, 'Institution ID not found.');            
        }

        // deleta uma instituição pelo ID e não retorna nada além de uma mensagem de sucesso
        await deleteInstitution(params.id);

        return res.json({
            message: 'Institution removed',
            data: null
        });

    } catch(err: any) {
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
    
}