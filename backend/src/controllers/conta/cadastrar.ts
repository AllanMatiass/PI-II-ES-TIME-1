import { Router } from 'express';
import { UserCadDTO } from '../../types/user';

const router = Router();

router.post("/cadastrar", (req, res) => {
    const body = req.body as UserCadDTO;

    if (!body["nome"] || !body["telefone"] || !body["email"] || !body["senha"] || !body["confirmaSenha"]) {
        res.status(400).json({
            erros: [
                "Faltam informações!"
            ]
        });
    }

    // Implementar verificações

    // Implementar banco de dados

    res.status(200).json({
        erros: []
    });
});

export default router;