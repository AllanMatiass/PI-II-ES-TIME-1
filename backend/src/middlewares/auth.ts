// Autores: Allan e Cristian
import { type NextFunction, type Request, type Response } from 'express'
import { AppError } from '../errors/AppError';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ProfessorResponseDTO } from 'dtos';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function isAuth(req: Request, res: Response, next: NextFunction) {
    // Captura o header "Authorization" do request (ex: "Bearer <token>")
    const authHeader = req.headers.authorization;

    // Caso o header não exista, lança erro 401 (não autorizado)
    if (!authHeader) throw new AppError(401, 'No token provided');

    // Divide o header em duas partes: [Bearer, token]
    const [, token] = authHeader.split(' ');

    // Se o token não for encontrado após o "Bearer", também é inválido
    if (!token) {
        throw new AppError(401, 'Invalid token');
    }

    try {
        // Verifica e decodifica o token JWT usando a chave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // O conteúdo decodificado (payload) é atribuído ao objeto `req.user`
        // Isso permite que outras rotas/middlewares saibam qual usuário está autenticado
        req.user = decoded as ProfessorResponseDTO;

        // Chama o próximo middleware ou controller na cadeia de execução
        next();
    } catch (err) {
        // Caso seja um erro controlado (AppError), responde com o status e mensagem apropriados
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        // Se o erro for devido ao JWT (token inválido ou expirado)
        // retorna 401 e sinaliza ao frontend para remover o token salvo
        if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token', removeToken: true });
        }

        // Se for um erro inesperado (ex: erro interno), loga e retorna 500
        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error', removeToken: true });
    }
}