import { Router } from "express";
import { createInstitution } from "../controllers/institution/institutionController";

const router = Router();

router.post("/institution",  async (req, res) => {
    console.log("POST /api/institution received");
    await createInstitution(req, res);
});

export default router;