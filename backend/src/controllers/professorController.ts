// Autor: Allan Giovanni Matias Paes e Murilo Rigoni
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { generateRecoveryToken, recoverPassword, updateProfessor } from '../services/professorService';

const resetTokens = new Map<number, string>(); // token -> email

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

// =========================
// Solicitação de redefinição
// =========================
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
	throw new AppError(400, 'Por favor, forneça um email');
  }

  try {
	const token = await generateRecoveryToken(resetTokens, email);

	res.json({ message: "E-mail de redefinição enviado com sucesso!", data: {
		token: token
	}}
);

  }catch (err: any) {
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
};

// =========================
// Redefinição da senha
// =========================
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const email = resetTokens.get(token);
  console.log(email);
  console.log(resetTokens);
  if (!email) {
	return res.status(400).json({ error: "Token inválido ou expirado." });
  }
  if (!newPassword){
	return res.status(400).json({ error: "senha não existe no body" });
	
  }
  if (!token){
	return res.status(400).json({ error: "token não existe no body" });
	
  }


  try {
	await recoverPassword(resetTokens, token, email, newPassword);
	res.json({ message: "Senha redefinida com sucesso!" });

  }catch (err: any) {
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
};

