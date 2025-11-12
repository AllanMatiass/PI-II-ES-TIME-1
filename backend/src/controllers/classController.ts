// Autor: Allan Matias e Cristian Fava
import fs from 'fs';
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { ClassRegisterRequestDTO, StudentRegisterDTO } from 'dtos';
import {
	deleteClass,
	findAllClasses,
	findClassByID,
	findClassBySubjectId,
	ImportClass,
	insertClass,
	updateClass,
	GetClassGradesForExport,
	GenerateCSVBuffer
} from '../services/classService';
import csvParser from 'csv-parser';

export async function POST_insertClass(req: Request, res: Response) {
	try {
		const { subject_id, name, classroom } = req.body as ClassRegisterRequestDTO;

		// Verifica se o body existe
		if (!req.body) {
			throw new AppError(
				400,
				'Body must contain subject_id, institution_id, course_id, name, classroom.'
			);
		}

		// Verifica campos obrigatórios
		const requiredFields = {
			subject_id,
			name,
			classroom,
		};

		for (const [key, value] of Object.entries(requiredFields)) {
			if (value === undefined || value === null || value === '') {
				throw new AppError(400, `Field '${key}' is required.`);
			}
		}

		// Sanitização e validações extras
		const sanitizedData = {
			subject_id: String(subject_id),
			name: String(name).trim(),
			classroom: String(classroom).trim(),
		} as ClassRegisterRequestDTO;

		const class_ = await insertClass(sanitizedData);

		res.status(200).json({
			message: 'Class created successfully',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function GET_findClassByID(req: Request, res: Response) {
	try {
		const { params } = req;

		// Verifica se o body existe
		if (!req.params || !params.id) {
			throw new AppError(400, 'You must provide the class ID as a parameter.');
		}

		const class_ = await findClassByID(params.id);

		return res.status(200).json({
			messasge: 'Class found.',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function GET_findAllClasses(req: Request, res: Response) {
	try {
		const class_ = await findAllClasses();

		return res.status(200).json({
			messasge: 'Class found.',
			data: class_,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function GET_findClassesBySubjectId(req: Request, res: Response) {
	try {
		const { params } = req;
		if (!params || !params.subId) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		const classes = await findClassBySubjectId(params.subId);

		return res.status(200).json({
			message: 'Classes by subject ID found.',
			data: classes,
		});
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function PUT_updateClass(req: Request, res: Response) {
	try {
		const { params, body } = req;

		if (!params.id) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		const { name, classroom } = body as ClassRegisterRequestDTO;

		if (!name || !classroom) {
			throw new AppError(400, 'Body must contain name and classroom.');
		}

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

		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function DELETE_deleteClass(req: Request, res: Response) {
	try {
		const { id } = req.params;

		if (!id) {
			throw new AppError(400, 'Param not found.');
		}

		const removed = await deleteClass(id);
		if (!removed) {
			throw new AppError(500, 'Internal server error on class removing');
		}

		return res.status(200).json({ message: 'Class removed successfully.' });
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function POST_ImportClass(req: Request, res: Response) {
	try {
		const classId = req.params.id;
		const filePath = req.file?.path;
		const data: StudentRegisterDTO[] = [];

		if (!classId) {
			throw new AppError(400, 'Missing propperty id.');
		}

		if (!filePath) {
			throw new AppError(400, 'Missing csv file!');
		}

		await new Promise<void>((resolve, reject) => {
			fs.createReadStream(filePath)
				.pipe(csvParser())
				.on('data', (row) => data.push(row))
				.on('end', resolve)
				.on('error', reject);
		});

		await ImportClass(data);

		return res.status(200).json({ message: 'Class imported successfully.' });
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function GET_ExportClass(req: Request, res: Response) {
	try {
		const { classId } = req.params;

		if (!classId) {
			throw new AppError(400, 'Param class ID is required');
		}

		// Busca as notas da turma + verifica se está completa
		const data = await GetClassGradesForExport(classId);

		// Gera CSV em memória
		const csvBuffer = GenerateCSVBuffer(data);

		// Gera nome do arquivo baseado na data
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const fileName = `${timestamp}-turma-${classId}.csv`;

		// Configura o download
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.setHeader('Content-Type', 'text/csv');

		return res.status(200).send(csvBuffer);
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}
		console.error('Erro inesperado ao exportar CSV:', err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
