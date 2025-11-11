// Autor: Emilly Morelatto
import { Router } from "express";
import { loginController, registerController } from "../controllers/authController";
import { exportClassCSVController } from "../controllers/exportController";

const router = Router();

router.post("/login", async (req, res) => {
    console.log("POST /api/login received");
    await loginController(req, res);
});

router.post('/register', async (req, res) => {
    console.log('POST /api/register received');
    await registerController(req, res);
});

// --- EXPORTAÇÃO EM CSV ---
router.get('/export/csv/:classId', async (req, res) => {
    console.log(`GET /api/export/csv/${req.params.classId} received`);
    await exportClassCSVController(req, res);
});

export default router;
