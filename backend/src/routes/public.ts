// Autoes: Allan Matias e Murilo Rigoni

import { Router } from "express";
// Importa os controladores responsáveis por login e registro
import { loginController, registerController } from "../controllers/authController";
// Importa funções de recuperação de senha
import { requestPasswordReset, resetPassword } from "../controllers/professorController";


const router = Router();
// Cria um roteador do Express para organizar as rotas

// Rota de Login
router.post("/login",  async (req, res) => {
    console.log("POST /api/login received");
    await loginController(req, res);
});

// Rota de registro de usuário
router.post('/register', async (req, res) => {
    console.log('POST /api/register');
    await registerController(req, res);
});

// Rota para pedir alteração de senha (envia e-mail com token)
router.post("/forgot-password", async (req, res) => {
    console.log('POST /api/forgot-password');
    await requestPasswordReset(req, res);
} );

// Rota para definir uma nova senha usando o token recebido
router.post("/reset-password", async (req, res) => {
    console.log('POST /api/reset-password');
    await resetPassword(req, res);
});

// Exporta o roteador para ser usado no servidor
export default router;