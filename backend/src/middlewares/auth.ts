import { type NextFunction, type Request, type Response } from 'express'
import { AppError } from '../errors/AppError';

export default async function isAuth(req: Request, res: Response, next: NextFunction) {
    try{
        if (req.session.user == null) {
            throw new AppError(401, "Faça login para acessar esta página!");
        }

    } catch(err){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }
        
        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }

    next();
}