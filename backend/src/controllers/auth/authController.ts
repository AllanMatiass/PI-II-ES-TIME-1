import { Request, Response } from 'express';
import { UserLoginDTO, UserCadDTO } from '../../types/user';


type Error = {
    code: number,
    message: string
}

export const loginController =  async (req: Request, res: Response) => {
    const body = req.body as UserLoginDTO;
    let errors: Error[] = [];

    if (!body['email'] || !body['password']){
        errors.push({
            code: 400, 
            message: 'Body must contain email and password.'
        });
    }

    // make db logic

    if (errors. length > 0) {
        const code = errors[0]?.code;
        return res.status(code ?? 500).json({
            errors: errors.map(e => e.message + '\n')
        });
    }   
    
    res.status(200).json({
        message: 'Login successful',
        data: null // User profile object ṕ
    })

}


export const registerController =  async (req: Request, res: Response) => {
    const body = req.body as UserCadDTO;
    let errors: Error[] = [];

    if (!body["name"] || !body["phone"] || !body["email"] || !body["password"] || !body["confirmPassword"]) {
        errors.push({
            code: 400, 
            message: 'Body must contain email, password, phone, name and confirmPassword'
        });
    }

    // make db logic

    if (errors. length > 0) {
        const code = errors[0]?.code;
        return res.status(code ?? 500).json({
            errors: errors.map(e => e.message + '\n')
        });
    }   
    
    res.status(200).json({
        message: 'Register successful',
        data: null // User profile object ṕ
    })

}
