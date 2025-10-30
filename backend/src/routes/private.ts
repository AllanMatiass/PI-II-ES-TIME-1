// Matias e Cristian

import { Router } from "express";
import { 
    createInstitution, 
    delInstitution, 
    findAllInstitutions, 
    findInstitutionById, 
    findInstitutionByProfessorId, 
    putInstitution, 
    relateProfessorWithInstitution 
} from "../controllers/institutionController";
import { GET_FindInstitutionCourses, POST_CreateCourse, PUT_UpdateCourse } from "../controllers/courseController";
import { GET_findAllClasses, GET_findClassByID, GET_findClassesBySubjectId, POST_insertClass, PUT_updateClass } from "../controllers/classController";

const router = Router();

// --- ROTAS DA INSTITUIÇÃO ---
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
    await findAllInstitutions(res);
})

router.get('/institution/:id', async (req, res) => {
    console.log(`GET /institution/${req.params.id} received`);
    await findInstitutionById(req, res);
});

router.get('/institution/by-professor/:id', async (req, res) => {
    console.log(`GET /institution/by-professor/${req.params.id} received`);
    await findInstitutionByProfessorId(req, res);
});

router.put('/institution/:id', async (req, res) => {
    console.log(`PUT /institution/${req.params.id} received`);
    await putInstitution(req, res);
});

router.delete('/institution/:id', async (req, res) => {
    console.log(`DELETE /institution/${req.params.id} received`);
    await delInstitution(req, res);
});

// --- ROTAS DO CURSO ---
router.post('/course', async (req, res) => {
    console.log("POST /api/course");
    await POST_CreateCourse(req, res);

});

router.put('/course', async (req, res) => {
    console.log("PUT /api/course");
    await PUT_UpdateCourse(req, res);
});

router.get('/courses', async (req, res) => {
    console.log("GET /api/institution/courses");
    await GET_FindInstitutionCourses(req, res);
});

// --- ROTAS DA CLASSE ---

router.post('/class', async (req, res) => {
    console.log('POST /api/class');
    await POST_insertClass(req, res);
});

router.get('/class/:id', async (req, res) => {
    console.log('GET /api/class/' + req.params.id);
    await GET_findClassByID(req, res);
});

router.get('/classes', async (req, res) => {
    console.log('GET /api/classes ');
    await GET_findAllClasses(req, res);
});

router.get('/classes/by-subject/:subId', async (req, res) => {
    console.log('GET /api/classes/by-subject/' + req.params.subId);
    await GET_findClassesBySubjectId(req, res);
});

router.put('/class/:id', async (req, res) => {
    console.log('PUT /api/class/' + req.params.id);
    await PUT_updateClass(req, res);
});

export default router;