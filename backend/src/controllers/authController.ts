import { Request, Response } from 'express';
import { ProfessorLoginRequestDTO, ProfessorRegisterRequestDTO, ProfessorResponseDTO } from 'dtos';
import { Login, Register } from '../services/auth';
import { AppError } from '../errors/AppError';

export async function loginController(req: Request, res: Response) {
	try{
		const body = req.body as ProfessorLoginRequestDTO;
	
		// Verifica se tem campos faltantes, caso tenha, dá erro.
		if (!body['email'] || !body['password']) {
			throw new AppError(400, 'Body must contain "email" and "password" fields');
		}
		
		// Chamando serviço para fazer o login.
		req.session.user = await Login(body['email'], body['password']);

		// Retorna com êxito caso tudo no Login ocorra bem.
		res.status(200).json({
			message: 'Login successful'
		});

	} catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
	
}

export async function registerController(req: Request, res: Response) {
	try{
		const body = req.body as ProfessorRegisterRequestDTO;

		// Verifica se tem campos faltantes, caso tenha, lança erro.
		if (
			!body['name'] ||
			!body['phone'] ||
			!body['email'] ||
			!body['password'] ||
			!body['confirmPassword']
		) {
			throw new AppError(400, 'Body must contain email, password, phone, name and confirmPassword');
		}

		// Compara se a senha e a senha de confirmação, caso sejam diferentes, lança erro.
		if (body['password'] != body['confirmPassword']) {
			throw new AppError(400, 'The passwords must be equal');
		}

		
		// Chama o serviço de regstro.
		await Register(body['email'], body['password'], body['name'], body['phone']);

		// Caso tudo ocorra bem, retorna com êxito.
		return res.status(200).json({
			message: 'Register successful',
		});
	}catch (err: any){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }

        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
	
}
