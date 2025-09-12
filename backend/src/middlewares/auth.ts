import { type NextFunction, type Request, type Response } from 'express'

export default async function IsAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user == null) {
        res.status(401).json({
            erros: [
                "Faça login para acessar esta página!"
            ]
        });

        res.end();
        return;
    }

    next();
}