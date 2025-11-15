// Autor: Cristian Eduardo Fava

import { CourseRegisterRequestDTO } from 'dtos';
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { DeleteCouse, GetInstitutionCourses, insertCourse as InsertCourse, UpdateCourse } from '../services/courseService';
import { CourseDataModel } from 'dataModels';

// Controller responsável por criar um novo curso
export async function POST_CreateCourse(req: Request, res: Response) {
	const body: CourseRegisterRequestDTO = req.body;

	try {
		// Verifica se os campos obrigatórios foram enviados
		if (!body.name || !body.institution_id) {
			throw new AppError(400, 'Missing course name or institution ID.');
		}

		// Chama o serviço para inserir o curso no banco
		const course = await InsertCourse(body);

		// Caso o retorno seja nulo, lança erro interno
		if (course == null) {
			throw new AppError(500, 'Unable to register course. Try again later!');
		}

		// Retorna sucesso e dados do curso criado
		res.status(200).json({
			message: 'Course registered successfully',
			data: course,
		});
	} catch (err: any) {
		// Trata erros conhecidos (AppError)
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		// Caso contrário, loga erro genérico
		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por atualizar um curso existente
export async function PUT_UpdateCourse(req: Request, res: Response) {
	try {
		const body: CourseDataModel = req.body;
		const courseId = req.params["course_id"];
		
		// Verifica se o parâmetro foi passado
		if (!courseId) {
			throw new AppError(400, 'Missing param course id.');
		}
		
		// Verifica se o nome foi informado
		if (!body.name) {
			throw new AppError(400, 'Missing course name.');
		}

		// Atualiza o curso com o novo nome
		const success = await UpdateCourse(body.name, courseId);

		// Caso falhe, lança erro interno
		if (!success) {
			throw new AppError(500, 'Unable to updated course. Try again later!');
		}

		// Retorna sucesso
		res.status(200).json({
			message: 'Course updated successfully'
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por deletar um curso
export async function DELETE_DeleteCourse(req: Request, res: Response) {
	try {
		const courseId = req.params["course_id"];

		// Verifica se o parâmetro foi passado
		if (!courseId) {
			throw new AppError(400, "Missing param course id.");
		}

		// Chama o serviço para deletar o curso
		const success = await DeleteCouse(courseId);

		// Caso a operação falhe, lança erro
		if (!success) {
			throw new AppError(500, "Unable to delete course. Try again later.");
		}
		
		// Retorna sucesso
		res.status(200).json({
			message: "Course deleted successfully."
		});

	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por buscar todos os cursos de uma instituição
export async function GET_FindInstitutionCourses(req: Request, res: Response) {
    try {
        const institutionId = req.params["institution_id"];

		// Verifica se o ID da instituição foi informado
        if (!institutionId) {
            throw new AppError(400, "Missing param institution id.");
        }

		// Busca todos os cursos da instituição
        const courses = await GetInstitutionCourses(institutionId);

		// Retorna sucesso com a lista de cursos
        res.status(200).json({
            message: "Courses found successfully.",
            data: courses
        });
    } catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
