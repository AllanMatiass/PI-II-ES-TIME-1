import { ProfessorResponseDTO } from 'dtos';
import 'express-session';

declare module 'express-session' {
	interface SessionData {
		user?: ProfessorResponseDTO;
	}
}
