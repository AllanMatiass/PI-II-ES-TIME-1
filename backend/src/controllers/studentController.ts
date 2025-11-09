// Autor: Allan Giovanni Matias Paes
import { StudentDTO, StudentResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertStudentIntoAClass, listStudentsInAClass } from "../services/studentService";
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