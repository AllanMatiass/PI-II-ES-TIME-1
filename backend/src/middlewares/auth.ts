import { NextFunction, type Request, type Response } from 'express'

function Auth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user != null) {
        next();
    } else {
        res.json({
            status: 401,
            data: null
        });
    }
}