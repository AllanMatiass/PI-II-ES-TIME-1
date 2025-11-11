import { type NextFunction, type Request, type Response } from 'express'
import { AppError } from '../errors/AppError';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ProfessorResponseDTO } from 'dtos';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function isAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError(401, 'No token provided');

    const [, token] = authHeader.split(' ') ;
        if (!token){
            throw new AppError(401, 'Invalid token');
        }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded as ProfessorResponseDTO;
        next();
    }catch(err) {
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError){
            return res.status(401).json({ error: 'Invalid token', removeToken: true });
        }

        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error',  removeToken: true });
    }
}