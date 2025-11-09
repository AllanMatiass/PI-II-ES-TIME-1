import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { updateProfessor } from '../services/professorService';

export async function UPDATE_professor(req: Request, res: Response) {
	try {
		if (!req.params.prof_id) throw new AppError(404, 'ID not found.');
		const professor = await updateProfessor(req.params.prof_id, req.body);
		return res.json({
			message: 'Professor updated',
			data: professor,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}
