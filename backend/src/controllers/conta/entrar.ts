import { Router } from 'express';
import { UserLoginDTO } from '../../types/user';

const router = Router();

router.post("/entrar", (req, res) => {
    const body = req.body as UserLoginDTO;

    if (!body["email"] || !body["senha"]) {
        res.status(400).json({
            erros: [
                "Email ou senha inválidos!"
            ]
        });
    }

    // Implementar banco de dados

    res.status(200).json({
        erros: [],
        data: null // Obj de perfil do usuário
    })
});

export default router;