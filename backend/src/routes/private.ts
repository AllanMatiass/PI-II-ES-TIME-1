import { Router } from "express";

const router = Router();

router.post("/institution",  async (req, res) => {
    console.log("POST /api/institution received");
    // await createInstitution();
});

export default router;