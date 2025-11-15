// Matias, Cristian e Emilly

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
	DELETE_DeleteCourse,
	GET_FindInstitutionCourses,
	POST_CreateCourse,
	PUT_UpdateCourse,
} from '../controllers/courseController';

import {
	DELETE_deleteClass,
	GET_findAllClasses,
	GET_findClassByID,
	GET_findClassesBySubjectId,
	POST_ImportClass,
	POST_insertClass,
	PUT_updateClass,
} from '../controllers/classController';

import {
	DELETE_DeleteSubject,
	GET_GetCourseSubjects,
	POST_CreateSubject,
	PUT_UpdateSubject,
} from '../controllers/subjectController';

import multer from 'multer';

import { getCurrentUser } from '../controllers/authController';
import { UPDATE_professor } from '../controllers/professorController';

import {
	insertStudent,
	listStudents,
	removeStudent,
	updateStudentController,
} from '../controllers/studentController';

import {
	PUT_UpdateScoreController,
	GET_ListGradesController,
	POST_AddComponent,
	POST_AddGrade,
	GET_GetComponentsBySubject,
	PUT_UpdateComponent,
	DELETE_DeleteComponent,
	POST_UpdateFinalFormulaController,
	GET_FinalFormulaController,
} from '../controllers/scoreController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// ======================================================================
// INSTITUIÇÃO
// ======================================================================

router.post('/institution', async (req, res) => {
	console.log('POST /api/institution received');
	await createInstitution(req, res);
});

router.post('/institution/relateWithProfessor', async (req, res) => {
	console.log('POST /api/institution/relateWithProfessor received');
	await relateProfessorWithInstitution(req, res);
});

router.get('/institution/all', async (_, res) => {
	console.log('GET /institution/all received');
	await findAllInstitutions(res);
});

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

// ======================================================================
// CURSOS
// ======================================================================

router.post('/course', async (req, res) => {
	console.log('POST /api/course');
	await POST_CreateCourse(req, res);
});

router.put('/course/:course_id', async (req, res) => {
	console.log('PUT /api/course');
	await PUT_UpdateCourse(req, res);
});

router.delete('/course/:course_id', async (req, res) => {
	console.log('DELETE /api/course/:course_id');
	await DELETE_DeleteCourse(req, res);
});

router.get('/courses/:institution_id', async (req, res) => {
	console.log('GET /api/courses');
	await GET_FindInstitutionCourses(req, res);
});

router.get('/course/:course_id/subjects', async (req, res) => {
	console.log(`GET /api/course/${req.params.course_id}/subjects`);
	await GET_GetCourseSubjects(req, res);
});

// ======================================================================
// TURMAS
// ======================================================================

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

router.post('/class/:id/import', upload.single('file'), async (req, res) => {
	console.log(`POST /api/class/${req.params.id}/import`);
	await POST_ImportClass(req, res);
});

router.get('/class/:id/export', async (req, res) => {
	console.log(`GET /api/class/${req.params.id}/export`);
	// (futuramente implementar exportação)
});

// ======================================================================
// DISCIPLINAS
// ======================================================================

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

// ======================================================================
// PROFESSOR
// ======================================================================

router.get('/profile', async (req, res) => {
	console.log('GET /api/profile');
	await getCurrentUser(req, res);
});

router.put('/professor/:prof_id', async (req, res) => {
	console.log('PUT /api/professor/' + req.params.prof_id);
	await UPDATE_professor(req, res);
});

// ======================================================================
// ALUNOS
// ======================================================================

router.post('/student/:classId', async (req, res) => {
	console.log('POST /api/student/' + req.params.classId);
	await insertStudent(req, res);
});

router.get('/students/:classId', async (req, res) => {
	console.log('GET /api/students/' + req.params.classId);
	await listStudents(req, res);
});

router.delete('/student/:classId/:registration_id', async (req, res) => {
	console.log('DELETE /api/student/' + req.params.classId);
	await removeStudent(req, res);
});

router.put('/student/:registration_id', async (req, res) => {
	console.log('PUT /api/student/' + req.params.registration_id);
	await updateStudentController(req, res);
});

// ======================================================================
// NOTAS
// ======================================================================

// Atualizar notas dos componentes
router.post('/subject/:subjectId/grades', async (req, res) => {
	console.log(`POST /api/subject/${req.params.subjectId}/grades`);
	await PUT_UpdateScoreController(req, res);
});

// Listar todas as notas da turma em uma disciplina
router.get('/class/:classId/subject/:subjectId/grades', async (req, res) => {
	console.log(
		`GET /api/class/${req.params.classId}/subject/${req.params.subjectId}/grades`
	);
	await GET_ListGradesController(req, res);
});

router.get('/subject/:subjectId/components', async (req, res) => {
	console.log(`GET /api/subject/${req.params.subjectId}/components`);
	await GET_GetComponentsBySubject(req, res);
});

// Criar um componente da disciplina
router.post('/subject/:subjectId/component', async (req, res) => {
	console.log(`POST /api/subject/${req.params.subjectId}/component`);
	await POST_AddComponent(req, res);
});

router.put('/component/:componentId', async (req, res) => {
	console.log(`PUT /api/component/${req.params.componentId}`);
	await PUT_UpdateComponent(req, res);
});

router.delete('/component/:componentId', async (req, res) => {
	console.log("DELETE /api/component/" + req.params.componentId);
	await DELETE_DeleteComponent(req, res);
});

// Fórmula final da disciplina
router.get('/subject/:subjectId/final-formula', async (req, res) => {
	console.log(`GET /api/subject/${req.params.subjectId}/final-formula`);
	await GET_FinalFormulaController(req, res);
});

router.post('/subject/:subjectId/final-formula', async (req, res) => {
	console.log(`POST /api/subject/${req.params.subjectId}/final-formula`);
	await POST_UpdateFinalFormulaController(req, res);
});

// Criar grade (associar aluno à disciplina)
router.post('/grade', async (req, res) => {
	console.log(`POST /api/grade`);
	await POST_AddGrade(req, res);
});


export default router;