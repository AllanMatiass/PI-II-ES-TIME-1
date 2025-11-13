// Autor: Allan Giovanni Matias Paes
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { updateProfessor } from '../services/professorService';

export async function UPDATE_professor(req: Request, res: Response) {
	try {
		// Extrai o ID do professor dos parâmetros da requisição, se não tiver, dá erro.

		if (!req.params.prof_id) throw new AppError(404, 'ID not found.');

		// Chama o serviço responsável por atualizar o professor no banco.
		// Essa função deve retornar o professor atualizado.
		const professor = await updateProfessor(req.params.prof_id, req.body);

		// Retorna uma resposta de sucesso com mensagem e os dados atualizados.
		return res.json({
			message: 'Professor updated',
			data: professor,
		});
	} catch (err: any) {
		// Caso o erro seja do tipo AppError (erro controlado),
		// retorna o código e a mensagem definidos na exceção.
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		// Caso contrário, é um erro inesperado (ex: erro de banco, bug, etc.).
		// Loga o erro no console para depuração e retorna 500 (Internal Server Error).
		console.error(err);
		return res.status(500).json({ error: 'Unexpected server error.' });
	}

}
