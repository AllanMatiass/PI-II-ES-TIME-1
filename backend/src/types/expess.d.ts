import { ProfessorResponseDTO } from 'dtos';

declare global {
    namespace Express {
        interface Request {
            user?: ProfessorResponseDTO;
        }
    }
}