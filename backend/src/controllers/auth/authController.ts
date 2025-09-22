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

	if (!body['email'] || !body['password']) {
		errors.push({
			code: 400,
			message: 'Body must contain email and password.',
		});
	}

	if (errors.length > 0) {
		const code = errors[0]?.code;
		return res.status(code ?? 500).json({
			errors: errors.map((e) => e.message + '\n'),
		});
	}

	// Perfil
	const userProfile = await Login(body['email'], body['password']);

	res.status(200).json({
		message: 'Login successful',
		data: userProfile,
	});
}

export async function registerController(req: Request, res: Response) {
	const body = req.body as ProfessorRegisterRequestDTO;
	let errors: Error[] = [];

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

	await Register(body['email'], body['password'], body['name'], body['phone']);

	res.status(200).json({
		message: 'Register successful',
	});
}