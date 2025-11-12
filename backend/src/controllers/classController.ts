// Autor: Allan Matias e Cristian Fava
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
		res.status(201).json({
			message: 'Class created successfully',
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

export async function GET_findClassByID(req: Request, res: Response) {
	try {
		const { params } = req;

		// Verifica se o body existe
		if (!req.params || !params.id) {
			throw new AppError(400, 'You must provide the class ID as a parameter.');
		}

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

export async function GET_findAllClasses(req: Request, res: Response) {
	try {
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

export async function GET_findClassesBySubjectId(req: Request, res: Response) {
	try {
		const { params } = req;
		if (!params || !params.subId) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		const classes = await findClassBySubjectId(params.subId);
		return res.json({
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

export async function PUT_updateClass(req: Request, res: Response) {
	try {
		const { params, body } = req;
		if (!params || !params.id) {
			throw new AppError(400, 'Subject ID must be provided as a parameter.');
		}

		if (!body) {
			throw new AppError(400, 'Body must contain something.');
		}

		const { name, classroom } = body as ClassRegisterRequestDTO;

		const class_ = await updateClass(params.id, {
			name,
			classroom,
		});
		return res.json({
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

		return res.status(204).send();
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
		const data: any = [];

		if (!classId) {
			throw new AppError(400, 'Missing propperty id.');
		}

		if (!filePath) {
			throw new AppError(400, 'Missing csv file!');
		}

		const stream = fs.createReadStream(filePath);
		stream.pipe(csvParser());

		stream.on('data', (line) => data.push(line));

		await new Promise((resolve: any) => {
			stream.on('end', resolve);
		});

		data.forEach((a: any) => console.log(a));
		res.sendStatus(200);
	} catch (err) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
