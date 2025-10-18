import { Router } from "express";
import { createInstitution, findAllInstitutions, findInstitutionById, findInstitutionByProfessorId, relateProfessorWithInstitution } from "../controllers/institution/institutionController";

const router = Router();

router.post("/institution",  async (req, res) => {
    console.log("POST /api/institution received");
    await createInstitution(req, res);
});

router.post('/institution/relateWithProfessor', async (req, res) => {
    console.log('POST /api/institution/relateWithProfessor received');
    await relateProfessorWithInstitution(req, res);
});

router.get('/institution/all', async (req, res) => {
    console.log('GET /institution/all received');
    ;await findAllInstitutions(res);
})

router.get('/institution/:id', async (req, res) => {
    console.log(`GET /institution/${req.params.id} received`);
    await findInstitutionById(req, res);
});

router.get('/institution/by-professor/:id', async (req, res) => {
    console.log(`GET /institution/by-professor/${req.params.id} received`);
    await findInstitutionByProfessorId(req, res);
});

export default router;