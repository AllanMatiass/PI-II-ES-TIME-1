// Autor: Cristian Fava

import { ProfessorResponseDTO } from 'dtos';
import 'express-session';

// Aqui diz ao TypeScript para adicionar um novo campo na sessão do express-session.
declare module 'express-session' {
	interface SessionData {
		// Esse campo "user" vai guardar os dados do professor logado.
		// O "?" indica que ele é opcional.
		user?: ProfessorResponseDTO;
	}
}
