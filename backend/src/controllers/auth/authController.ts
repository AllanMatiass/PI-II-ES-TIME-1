import { Request, Response } from 'express';
import { ProfessorLoginRequestDTO, ProfessorRegisterRequestDTO } from 'dtos';
import { Login, Register } from '../../services/auth';

type Error = {
	code: number;
	message: string;
};

export async function loginController(req: Request, res: Response) {
	const body = req.body as ProfessorLoginRequestDTO;
	let errors: Error[] = [];
	
	// Verifica se tem campos faltantes, caso tenha, dá erro.
	if (!body['email'] || !body['password']) {
		errors.push({
			code: 400,
			message: 'Body must contain email and password.',
		});
	}

	// Montando a resposta do erro e lançando-o.
	if (errors.length > 0) {
		const code = errors[0]?.code;
		return res.status(code ?? 500).json({
			errors: errors.map((e) => e.message + '\n'),
		});
	}

	// Chamando serviço para fazer o login.
	const userProfile = await Login(body['email'], body['password']);

	// Retorna com êxito caso tudo no Login ocorra bem.
	res.status(200).json({
		message: 'Login successful',
		data: userProfile,
	});
}

export async function registerController(req: Request, res: Response) {
	const body = req.body as ProfessorRegisterRequestDTO;
	let errors: Error[] = [];

	// Verifica se tem campos faltantes, caso tenha, lança erro.
	if (
		!body['name'] ||
		!body['phone'] ||
		!body['email'] ||
		!body['password'] ||
		!body['confirmPassword']
	) {
		errors.push({
			code: 400,
			message:
				'Body must contain email, password, phone, name and confirmPassword',
		});
	}

	// Compara se a senha e a senha de confirmação, caso sejam diferentes, lança erro.
	if (body['password'] != body['confirmPassword']) {
		errors.push({
			code: 400,
			message: 'The password must be equal',
		});
	}

	if (errors.length > 0) {
		const code = errors[0]?.code;
		return res.status(code ?? 500).json({
			errors: errors.map((e) => e.message + '\n'),
		});
	}

	// Chama o serviço de regstro.
	await Register(body['email'], body['password'], body['name'], body['phone']);

	// Caso tudo ocorra bem, retorna com êxito.
	res.status(200).json({
		message: 'Register successful',
	});
}