// Matias e Cristian

import { Router } from 'express';
import {
	createInstitution,
	delInstitution,
	findAllInstitutions,
	findInstitutionById,
	findInstitutionByProfessorId,
	putInstitution,
	relateProfessorWithInstitution,
} from '../controllers/institutionController';
import {
	GET_FindInstitutionCourses,
	POST_CreateCourse,
	PUT_UpdateCourse,
} from '../controllers/courseController';
import {
	DELETE_deleteClass,
	GET_findAllClasses,
	GET_findClassByID,
	GET_findClassesBySubjectId,
	POST_insertClass,
	PUT_updateClass,
} from '../controllers/classController';
import {
	DELETE_DeleteSubject,
	GET_GetCourseSubjects,
	POST_CreateSubject,
	PUT_UpdateSubject,
} from '../controllers/subjectController';
import multer from "multer";
import { getCurrentUser } from '../controllers/authController';

const router = Router();
const upload = multer({ dest: "uploads/" });

// --- ROTAS DA INSTITUIÇÃO ---
router.post('/institution', async (req, res) => {
	console.log('POST /api/institution received');
	await createInstitution(req, res); // Cria uma nova instituição
});

router.post('/institution/relateWithProfessor', async (req, res) => {
	console.log('POST /api/institution/relateWithProfessor received');
	await relateProfessorWithInstitution(req, res); // Relaciona professor com instituição
});

router.get('/institution/all', async (req, res) => {
	console.log('GET /institution/all received');
	await findAllInstitutions(res); // Busca todas as instituições
});

router.get('/institution/:id', async (req, res) => {
	console.log(`GET /institution/${req.params.id} received`);
	await findInstitutionById(req, res); // Busca uma instituição específica pelo ID
});

router.get('/institution/by-professor/:id', async (req, res) => {
	console.log(`GET /institution/by-professor/${req.params.id} received`);
	await findInstitutionByProfessorId(req, res); // Busca instituição pelo ID do professor
});

router.put('/institution/:id', async (req, res) => {
	console.log(`PUT /institution/${req.params.id} received`);
	await putInstitution(req, res); // Atualiza dados da instituição
});

router.delete('/institution/:id', async (req, res) => {
	console.log(`DELETE /institution/${req.params.id} received`);
	await delInstitution(req, res); // Deleta uma instituição
});

// --- ROTAS DO CURSO ---
router.post('/course', async (req, res) => {
	console.log('POST /api/course');
	await POST_CreateCourse(req, res);
});

router.put('/course', async (req, res) => {
	console.log('PUT /api/course');
	await PUT_UpdateCourse(req, res);
});

router.get('/courses/:institution_id', async (req, res) => {
	console.log('GET /api/courses');
	await GET_FindInstitutionCourses(req, res);
});

router.get('/course/:course_id/subjects', async (req, res) => {
	console.log(`GET /api/course/${req.params.course_id}/subjects`);
	await GET_GetCourseSubjects(req, res);
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

router.delete('/class/:id', async (req, res) => {
	console.log('DELETE /api/class/' + req.params.id);
	await DELETE_deleteClass(req, res);
});

router.post('/class/:id/import', upload.single("file"), (req, res) => {
	console.log(`POST /api/class/${req.params.id}/import`);
});

// --- ROTAS DA DISCIPLINA ---
router.post('/subject', async (req, res) => {
	console.log('POST /api/subject/');
	await POST_CreateSubject(req, res);
});

router.put('/subject/:subject_id', async (req, res) => {
	console.log('PUT /api/subject/' + req.params.subject_id);
	await PUT_UpdateSubject(req, res);
});

router.delete('/subject/:subject_id', async (req, res) => {
	console.log('DELETE /api/subject/' + req.params.subject_id);
	await DELETE_DeleteSubject(req, res);
});

// ROTAS DE PROFESSOR
router.get('/profile', async (req, res) => {
	console.log('GET /api/profile');
	await getCurrentUser(req, res);
});

export default router;