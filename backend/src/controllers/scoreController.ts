// Autores originais: Emilly Morelatto e Mateus Campos
// Versão corrigida por ChatGPT

import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import {
	updateScoreService,
	listScoreService,
	addComponentService,
	addGradeService,
	getGradeById,
	getComponentsBySubjectService,
	updateComponentService,
	deleteComponentService,
	updateFinalFormulaService,
	getFinalFormulaService,
} from '../services/scoreService';

// Tipos de dados usados no corpo da requisição
import { GradeComponentRequestDTO, ScoreRequestDTO } from 'dtos';

// 1. ATUALIZAR NOTAS DOS COMPONENTES

export async function PUT_UpdateScoreController(req: Request, res: Response) {
	try {
		const { subjectId } = req.params;

		// Verifica se veio o ID da disciplina
		if (!subjectId) {
			throw new AppError(
				400,
				'Params must contain: /subject/:subjectId/grades'
			);
		}

		// Pega os dados enviados no body
		const score = req.body as ScoreRequestDTO;

		// Verifica se veio os dados obrigatórios
		if (!score.component_id || !score.student_id || score.student_id == undefined) {
			throw new AppError(400, "Invalid body!");
		}

		// Envia para o serviço que realmente atualiza as notas
		const result = await updateScoreService(subjectId, score, req.user!.id);

		return res.status(200).json({
			message: 'Grades successfully submitted',
			data: result,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// 2. LISTAR NOTAS TERCEIRO
export async function GET_ListGradesController(req: Request, res: Response) {
	try {
		const { classId, subjectId } = req.params;

		if (!classId || !subjectId) {
			throw new AppError(
				400,
				'Params must follow: /class/:classId/subject/:subjectId/grades'
			);
		}

		const result = await listScoreService(classId, subjectId);

		return res.status(200).json({
			message: 'Grades listed successfully',
			data: result,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// 2. LISTAR NOTAS DE UMA TURMA EM UMA DISCIPLINA

export async function GET_ListGradesController(req: Request, res: Response) {
	try {
		const { classId, subjectId } = req.params;

		// Garante que os dois IDs foram passados
		if (!classId || !subjectId) {
			throw new AppError(
				400,
				'Params must follow: /class/:classId/subject/:subjectId/grades'
			);
		}

		// Busca notas pelo serviço
		const result = await listScoreService(classId, subjectId);

		return res.status(200).json({
			message: 'Grades listed successfully',
			data: result,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// 3. CRIAR COMPONENTE DA DISCIPLINA (não envolve aluno)

export async function POST_AddComponent(req: Request, res: Response) {
	try {
		// Dados enviados pelo usuário
		let data = req.body as GradeComponentRequestDTO;

		// Deixa a sigla sempre em MAIÚSCULO
		data.formula_acronym = data.formula_acronym.toUpperCase();

		// Cria o componente no banco
		const result = await addComponentService(data, req.user!.id);

		return res.status(201).json(result);
	} catch (error: any) {
		if (error instanceof AppError) {
			return res.status(error.code).json({ error: error.message });
		}

		console.log(error);
		return res.status(500).json({ error: 'Erro interno do servidor.' });
	}
}

// 4. CRIAR GRADE (associar aluno à disciplina)

export async function POST_AddGrade(req: Request, res: Response) {
	try {
		const { student_id, subject_id } = req.body;

		// Confirma dados obrigatórios
		if (!student_id || !subject_id)
			throw new AppError(400, 'student_id e subject_id são obrigatórios.');

		// Cria o vínculo aluno-disciplina
		const creationResult = await addGradeService({
			student_id,
			subject_id,
		});

		// Busca os dados completos da grade criada
		const grade = await getGradeById(creationResult.grade_id);

		return res.status(201).json({
			message: 'Grade created successfully!',
			grade,
		});
	} catch (error: any) {
		if (error instanceof AppError) {
			return res.status(error.code).json({ error: error.message });
		}

		console.error(error);
		return res.status(500).json({ error: 'Erro interno do servidor.' });
	}
}

// 5. LISTAR COMPONENTES DE NOTA

export async function GET_GetComponentsBySubject(req: Request, res: Response) {
	try {
		const subjectId = req.params.subjectId;

		if (!subjectId) {
			throw new AppError(400, 'Missing param subject id.');
		}

		// Busca no serviço todos os componentes
		const result = await getComponentsBySubjectService(subjectId);

		return res.status(200).json({ data: result });
	} catch (error: any) {
		if (error instanceof AppError) {
			return res.status(error.code).json({ error: error.message });
		}

		console.error(error);
		return res.status(500).json({ error: 'Erro interno do servidor.' });
	}
}

// 6. ALTERAR COMPONENTES DE NOTA
export async function PUT_UpdateComponent(req: Request, res: Response) {
	try {
		const componentId = req.params.componentId;
		const data = req.body as Partial<GradeComponentRequestDTO>;
		
		// Se enviaram sigla, deixa em maiúsculo
		if (data.formula_acronym) {
			data.formula_acronym = data.formula_acronym.toUpperCase();
		}

		if (!componentId) {
			throw new AppError(400, 'Missing param component id.');
		}

		const result = await updateComponentService(componentId, data, req.user!.id);

		return res.status(200).json({ data: result });
	} catch (error: any) {
		if (error instanceof AppError) {
			return res.status(error.code).json({ error: error.message });
		}

		console.error(error);
		return res.status(500).json({ error: 'Erro interno do servidor.' });
	}
}

// 7. DELETAR COMPONENTE
export async function DELETE_DeleteComponent(req: Request, res: Response) {
	try {
		const componentId = req.params.componentId;
		const data = req.body as Partial<GradeComponentRequestDTO>;

		if (!componentId) {
			throw new AppError(400, 'Missing param component id.');
		}

		const result = await deleteComponentService(componentId, req.user!.id);

		return res.status(200).json({ data: result });
	} catch (error: any) {
		if (error instanceof AppError) {
			return res.status(error.code).json({ error: error.message });
		}

		console.error(error);
		return res.status(500).json({ error: 'Erro interno do servidor.' });
	}
}

// 8. GET - Obter fórmula final

export async function GET_FinalFormulaController(req: Request, res: Response) {
	try {
		const { subjectId } = req.params;

		if (!subjectId) {
			throw new AppError(400, 'Missing param subjectId.');
		}

		// Busca a fórmula no banco
		const result = await getFinalFormulaService(subjectId);

		return res.status(200).json({
			message: 'Formula loaded successfully',
			...result,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// 9. POST - Criar / Atualizar fórmula final

export async function POST_UpdateFinalFormulaController(
	req: Request,
	res: Response
) {
	try {
		const { subjectId } = req.params;
		const { formula_text } = req.body;

		if (!subjectId) {
			throw new AppError(400, 'Missing subjectId.');
		}

		if (!formula_text) {
			throw new AppError(400, 'Missing formula_text.');
		}

		// Salva fórmula (sempre em MAIÚSCULO)
		const result = await updateFinalFormulaService(subjectId, formula_text.toUpperCase(), req.user!.id);

		return res.status(201).json({
			message: result.message,
			formula_text,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
