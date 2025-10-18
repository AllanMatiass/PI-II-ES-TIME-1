import { Router } from "express";
import { createInstitution, findAllInstitutions } from "../controllers/institution/institutionController";

const router = Router();

router.post("/institution",  async (req, res) => {
    console.log("POST /api/institution received");
    await createInstitution(req, res);
});

router.get('/institution/all', async (req, res) => {
    console.log('GET /institution/all received');
    await findAllInstitutions(res);
})

export default router;