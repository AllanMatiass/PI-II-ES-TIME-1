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
import {
	DELETE_DeleteSubject,
	GET_GetCourseSubjects,
	POST_CreateSubject,
	PUT_UpdateSubject,
} from '../controllers/subjectController';

// Cria o roteador principal da API
const router = Router();

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
	await POST_CreateCourse(req, res); // Cria um novo curso
});

router.put('/course', async (req, res) => {
	console.log('PUT /api/course');
	await PUT_UpdateCourse(req, res); // Atualiza um curso existente
});

router.get('/courses', async (req, res) => {
	console.log('GET /api/institution/courses');
	await GET_FindInstitutionCourses(req, res); // Lista cursos de uma instituição
});

router.get('/course/:id/subjects', async (req, res) => {
	console.log(`GET /api/course/${req.params.id}/subjects`);
	await GET_GetCourseSubjects(req, res); // Busca disciplinas de um curso
});

// --- ROTAS DA CLASSE ---
router.post('/class', async (req, res) => {
	console.log('POST /api/class');
	await POST_insertClass(req, res); // Cria uma nova classe
});

router.get('/class/:id', async (req, res) => {
	console.log('GET /api/class/' + req.params.id);
	await GET_findClassByID(req, res); // Busca uma classe específica
});

router.get('/classes', async (req, res) => {
	console.log('GET /api/classes ');
	await GET_findAllClasses(req, res); // Lista todas as classes
});

router.get('/classes/by-subject/:subId', async (req, res) => {
	console.log('GET /api/classes/by-subject/' + req.params.subId);
	await GET_findClassesBySubjectId(req, res); // Lista classes vinculadas a uma disciplina
});

router.put('/class/:id', async (req, res) => {
	console.log('PUT /api/class/' + req.params.id);
	await PUT_updateClass(req, res); // Atualiza informações de uma classe
});

// --- ROTAS DA DISCIPLINA ---
router.post('/subject', async (req, res) => {
	console.log('POST /api/subject');
	await POST_CreateSubject(req, res); // Cria uma nova disciplina
});

router.put('/subject/:id', async (req, res) => {
	console.log('PUT /api/subject/' + req.params.id);
	await PUT_UpdateSubject(req, res); // Atualiza uma disciplina existente
});

router.delete('/subject/:id', async (req, res) => {
	console.log('DELETE /api/subject' + req.params.id);
	await DELETE_DeleteSubject(req, res); // Deleta uma disciplina
});

// Exporta o roteador para ser usado no servidor principal
export default router;