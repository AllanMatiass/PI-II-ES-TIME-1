// Autor: Allan Giovanni Matias Paes
import { StudentDTO, StudentResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertStudentIntoAClass, listStudentsInAClass, removeStudentFromAClass, updateStudent } from "../services/studentService";
import { AppError } from "../errors/AppError";

// Controller para Inserir um aluno em uma classe
export async function insertStudent(req: Request, res: Response) {
    try{
        // Pega o ID da classe a partir dos parâmetros da rota
        const classId = req.params.classId;

        // Se o ID da classe não foi informado, lança erro
        if (!classId) throw new AppError(404, 'Class not found.');
        
        // Extrai os dados do estudante do corpo da requisição
        const {name, registration_id} = req.body as StudentDTO;
        
        // Chama o service para inserir o estudante na classe
        const student = await insertStudentIntoAClass({name, registration_id}, classId) as StudentResponseDTO;

        // Retorna ao cliente uma resposta clara e o objeto do estudante inserido
        return res.json({
            message: 'Student was inserted successfully.',
            data: student
        });
        
    } catch (err: any){
        // Se o erro for do tipo AppError, responde com o status e a mensagem definidos
        if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

        // Caso seja outro erro, registra no servidor e retorna erro genérico
		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
    }
}

export async function listStudents(req: Request, res: Response) {
    try{

        // Pega o ID da classe a partir dos parâmetros da rota
        const classId = req.params.classId;

        // Se o ID da classe não foi informado, lança erro
        if (!classId) throw new AppError(404, 'Class not found.');

        // Chama o service para pegar os estudantes naquela classe
        const students: StudentResponseDTO[] = await listStudentsInAClass(classId);

        // Retorna ao cliente uma resposta clara e os objetos dos estudantes naquela classe
        return res.json({
            message: 'Students found.',
            data: students
        });
        
    }catch (err: any){
        // Se o erro for do tipo AppError, responde com o status e a mensagem definidos
        if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

        // Caso seja outro erro, registra no servidor e retorna erro genérico
		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
    }
    
}

// Controller para remover um aluno da classe
export async function removeStudent(req: Request, res: Response) {
    try {
        // Obtém o ID da classe a partir dos parâmetros da rota
        const classId = req.params.classId;

        // Obtém o registration_id do corpo da requisição
        const { registration_id } = req.body;

        // Se o ID da classe não foi informado, retorna erro
        if (!classId) throw new AppError(404, 'Class not Found.');

        // Se o registration_id não foi informado, retorna erro de requisição inválida
        if (!registration_id) throw new AppError(400, 'registration_id is required.');

        // Chama o service responsável pela remoção do aluno da classe
        const removedStudent = await removeStudentFromAClass(registration_id, classId);

        // Retorna resposta de sucesso com o aluno removido
        return res.json({
            message: 'Student was removed successfully.',
            data: removedStudent
        });

    } catch (err: any) {

        // Se for um erro tratado (AppError), responde com o status e mensagem configurados
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        // Caso seja um erro inesperado, loga no servidor e retorna erro 500
        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}

// Controller para atualizar dados de um aluno
export async function updateStudentController(req: Request, res: Response) {
    try {
        // Busca o registration_id pela rota
        const registration_id = req.params.registration_id;

        // Se não passar o registration_id, rota está sendo chamada incorretamente
        if (!registration_id) throw new AppError(400, 'registration_id is required in params.');

        // Dados a atualizar vêm do body
        const { name, registration_id: newRegistrationId } = req.body;

        // Chama o service
        const updatedStudent = await updateStudent(
            { name, registration_id: newRegistrationId },
            registration_id
        );

        // Retorna resposta de sucesso
        return res.json({
            message: 'Student was updated successfully.',
            data: updatedStudent
        });

    } catch (err: any) {

        // Trata erros conhecidos
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        // Erro inesperado
        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}

