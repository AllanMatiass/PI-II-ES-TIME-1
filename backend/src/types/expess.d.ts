// Autor: Cristian Fava

import { ProfessorResponseDTO } from 'dtos';

// Aqui diz ao TypeScript para adicionar algo novo à tipagem padrão do Express.
declare global {
    namespace Express {
        interface Request {
            // Adiciona o campo "user" dentro do request.
            // Esse campo guarda os dados do professor que está logado.
            user?: ProfessorResponseDTO;
        }
    }
}