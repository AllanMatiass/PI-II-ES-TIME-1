import { Router } from "express";
import { loginController, registerController } from "../controllers/auth/authController";

const router = Router();

router.post("/login",  async (req, res) => {
    console.log("POST /api/login received");
    await loginController(req, res);
});

router.post('/register', async (req, res) => {
    console.log('POST /api/register');
    await registerController(req, res);
})

export default router;