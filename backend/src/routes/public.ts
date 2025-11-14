import { Router } from "express";
import { loginController, registerController } from "../controllers/authController";
import { requestPasswordReset, resetPassword } from "../controllers/professorController";


const router = Router();

router.post("/login",  async (req, res) => {
    console.log("POST /api/login received");
    await loginController(req, res);
});

router.post('/register', async (req, res) => {
    console.log('POST /api/register');
    await registerController(req, res);
});
// --- EXPORTAÇÃO EM CSV ---
router.get('/export/csv/:classId', async (req, res) => {
    console.log(`GET /api/export/csv/${req.params.classId} received`);
    await exportClassCSVController(req, res);
});



router.post("/forgot-password", async (req, res) => {
    console.log('POST /api/forgot-password');
    await requestPasswordReset(req, res);
} );

router.post("/reset-password", async (req, res) => {
    console.log('POST /api/reset-password');
    await resetPassword(req, res);
});

export default router;