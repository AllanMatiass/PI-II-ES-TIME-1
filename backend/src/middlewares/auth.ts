import { type NextFunction, type Request, type Response } from 'express'

export default async function isAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user == null) {
        res.status(401).json({
            errors: [
                "Faça login para acessar esta página!"
            ]
        });

        res.end();
        return;
    }

    next();
}