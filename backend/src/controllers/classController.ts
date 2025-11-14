// Autores: Allan Matias, Cristian Fava e Emilly Morelatto
import fs from 'fs';
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { ClassRegisterRequestDTO } from 'dtos';
import {
	deleteClass,
	findAllClasses,
	findClassByID,
	findClassBySubjectId,
	insertClass,
	updateClass,
} from '../services/classService';
import csvParser from 'csv-parser';

// Controller responsável por criar uma nova turma
export async function POST_insertClass(req: Request, res: Response) {
	try {
		const { subject_id, name, classroom } = req.body as ClassRegisterRequestDTO;

		// Verifica se o corpo da requisição foi enviado
		if (!req.body) {
			throw new AppError(
				400,
				'Body must contain subject_id, institution_id, course_id, name, classroom.'
			);
		}

		// Campos obrigatórios para criação da turma
		const requiredFields = {
			subject_id,
			name,
			classroom,
		};

		// Verifica se algum campo obrigatório está ausente
		for (const [key, value] of Object.entries(requiredFields)) {
			if (value === undefined || value === null || value === '') {
				throw new AppError(400, `Field '${key}' is required.`);
			}
		}

		// Sanitiza os dados (remove espaços e força tipo string)
		const sanitizedData = {
			subject_id: String(subject_id),
			name: String(name).trim(),
			classroom: String(classroom).trim(),
		} as ClassRegisterRequestDTO;

		// Insere a turma no banco de dados
		const class_ = await insertClass(sanitizedData);


		// Retorna sucesso com os dados da turma criada
		res.status(200).json({
			message: 'Class created successfully',
			data: class_,
		});
	} catch (err) {
		// Trata erros esperados (AppError)
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		// Loga e retorna erro inesperado
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller para buscar turma pelo ID
export async function GET_findClassByID(req: Request, res: Response) {
	try {
		const { params } = req;

		// Verifica se o parâmetro id foi enviado
		if (!req.params || !params.id) {
			throw new AppError(400, 'You must provide the class ID as a parameter.');
		}

		// Busca a turma pelo ID
		const class_ = await findClassByID(params.id);

		return res.json({
			messasge: 'Class found.',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller que busca todas as turmas
export async function GET_findAllClasses(req: Request, res: Response) {
	try {
		// Busca todas as turmas cadastradas
		const class_ = await findAllClasses();

		return res.json({
			messasge: 'Class found.',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller que busca turmas pelo ID da disciplina
export async function GET_findClassesBySubjectId(req: Request, res: Response) {
	try {
		const { params } = req;

		// Verifica se o ID da disciplina foi enviado
		if (!params || !params.subId) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		// Busca as turmas associadas a uma disciplina
		const classes = await findClassBySubjectId(params.subId);


		return res.status(200).json({
			message: 'Classes by subject ID found.',
			data: classes,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por atualizar uma turma
export async function PUT_updateClass(req: Request, res: Response) {
	try {
		const { params, body } = req;

		// Verifica se o ID da turma foi passado
		if (!params || !params.id) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		// Verifica se o corpo da requisição foi enviado
		if (!body) {
			throw new AppError(400, 'Body must contain something.');
		}

		const { name, classroom } = body as ClassRegisterRequestDTO;

		if (!name || !classroom) {
			throw new AppError(400, 'Body must contain name and classroom.');
		}

		// Atualiza a turma no banco
		const class_ = await updateClass(params.id, {
			name,
			classroom,
		});


		return res.status(200).json({
			message: 'Class updated.',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por deletar uma turma
export async function DELETE_deleteClass(req: Request, res: Response) {
	try {
		const { id } = req.params;

		// Verifica se o ID foi enviado
		if (!id) {
			throw new AppError(400, 'Param not found.');
		}

		// Remove a turma
		const removed = await deleteClass(id);

		// Caso não tenha conseguido remover, lança erro
		if (!removed) {
			throw new AppError(500, 'Internal server error on class removing');
		}

		// Retorna status 204 (sem conteúdo)
		return res.status(200).json({ message: 'Class removed successfully.' });
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

// Controller responsável por importar dados de turma via CSV
export async function POST_ImportClass(req: Request, res: Response) {
	try {
		const classId = req.params.id;
		const filePath = req.file?.path;
		const data: any = [];

		// Verifica se o ID da turma foi enviado
		if (!classId) {
			throw new AppError(400, 'Missing propperty id.');
		}

		// Verifica se o arquivo CSV foi enviado
		if (!filePath) {
			throw new AppError(400, 'Missing csv file!');
		}

		// Cria stream para ler o arquivo CSV
		const stream = fs.createReadStream(filePath);

		// Passa o conteúdo pelo parser
		stream.pipe(csvParser());

		// Adiciona cada linha do CSV no array de dados
		stream.on('data', (line) => data.push(line));

		// Aguarda o término da leitura
		await new Promise((resolve: any) => {
			stream.on('end', resolve);
		});

		// Mostra o conteúdo do CSV no console
		data.forEach((a: any) => console.log(a));

		// Retorna sucesso
		res.sendStatus(200);
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
