// Matias, Cristian e Emilly

import { Router } from "express";

// Importa todas as funções responsáveis por lidar com instituições
import {
  createInstitution,
  delInstitution,
  findAllInstitutions,
  findInstitutionById,
  findInstitutionByProfessorId,
  putInstitution,
  relateProfessorWithInstitution,
} from "../controllers/institutionController";

// Importa funções que tratam dos cursos
import {
  DELETE_DeleteCourse,
  GET_FindInstitutionCourses,
  POST_CreateCourse,
  PUT_UpdateCourse,
} from "../controllers/courseController";

// Importa funções da parte de turmas
import {
  DELETE_deleteClass,
  GET_ExportClass,
  GET_findAllClasses,
  GET_findClassByID,
  GET_findClassesBySubjectId,
  POST_ImportClass,
  POST_insertClass,
  PUT_updateClass,
} from "../controllers/classController";

// Importa funções das disciplinas
import {
  DELETE_DeleteSubject,
  GET_GetCourseSubjects,
  POST_CreateSubject,
  PUT_UpdateSubject,
} from "../controllers/subjectController";

// Biblioteca usada para upload de arquivos
import multer from "multer";

// Importa funções do login/usuário atual
import { getCurrentUser } from "../controllers/authController";
import { UPDATE_professor } from "../controllers/professorController";

// Importa funções dos alunos
import {
  insertStudent,
  listStudents,
  removeStudent,
  updateStudentController,
} from "../controllers/studentController";

// Importa funções de notas e componentes avaliativos
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
} from "../controllers/scoreController";

// Cria o roteador do Express
const router = Router();

// Configura o upload de arquivos (armazenando na pasta uploads/)
const upload = multer({ dest: "uploads/" });

// ======================================================================
// INSTITUIÇÃO
// ======================================================================

// Cria uma nova instituição
router.post("/institution", async (req, res) => {
  console.log("POST /api/institution received");
  await createInstitution(req, res);
});

// Relaciona um professor a uma instituição
router.post("/institution/relateWithProfessor", async (req, res) => {
  console.log("POST /api/institution/relateWithProfessor received");
  await relateProfessorWithInstitution(req, res);
});

// Lista todas as instituições
router.get("/institution/all", async (_, res) => {
  console.log("GET /institution/all received");
  await findAllInstitutions(res);
});

// Busca uma instituição pelo ID
router.get("/institution/:id", async (req, res) => {
  console.log(`GET /institution/${req.params.id} received`);
  await findInstitutionById(req, res);
});

// Busca instituição vinculada ao professor
router.get("/institution/by-professor/:id", async (req, res) => {
  console.log(`GET /institution/by-professor/${req.params.id} received`);
  await findInstitutionByProfessorId(req, res);
});

// Atualiza dados de uma instituição
router.put("/institution/:id", async (req, res) => {
  console.log(`PUT /institution/${req.params.id} received`);
  await putInstitution(req, res);
});

// Remove uma instituição
router.delete("/institution/:id", async (req, res) => {
  console.log(`DELETE /institution/${req.params.id} received`);
  await delInstitution(req, res);
});

// ======================================================================
// CURSOS
// ======================================================================

// Cria um curso
router.post("/course", async (req, res) => {
  console.log("POST /api/course");
  await POST_CreateCourse(req, res);
});

// Atualiza os dados do curso
router.put("/course/:course_id", async (req, res) => {
  console.log("PUT /api/course");
  await PUT_UpdateCourse(req, res);
});

// Remove um curso
router.delete("/course/:course_id", async (req, res) => {
  console.log("DELETE /api/course/:course_id");
  await DELETE_DeleteCourse(req, res);
});

// Lista todos os cursos de uma instituição
router.get("/courses/:institution_id", async (req, res) => {
  console.log("GET /api/courses");
  await GET_FindInstitutionCourses(req, res);
});

// Lista disciplinas de um curso
router.get("/course/:course_id/subjects", async (req, res) => {
  console.log(`GET /api/course/${req.params.course_id}/subjects`);
  await GET_GetCourseSubjects(req, res);
});

// ======================================================================
// TURMAS
// ======================================================================

// Cria uma nova turma
router.post("/class", async (req, res) => {
  console.log("POST /api/class");
  await POST_insertClass(req, res);
});

// Busca turma pelo ID
router.get("/class/:id", async (req, res) => {
  console.log("GET /api/class/" + req.params.id);
  await GET_findClassByID(req, res);
});

// Lista todas as turmas
router.get("/classes", async (req, res) => {
  console.log("GET /api/classes ");
  await GET_findAllClasses(req, res);
});

// Lista turmas por disciplina
router.get("/classes/by-subject/:subId", async (req, res) => {
  console.log("GET /api/classes/by-subject/" + req.params.subId);
  await GET_findClassesBySubjectId(req, res);
});

// Atualiza dados da turma
router.put("/class/:id", async (req, res) => {
  console.log("PUT /api/class/" + req.params.id);
  await PUT_updateClass(req, res);
});

// Remove uma turma
router.delete("/class/:id", async (req, res) => {
  console.log("DELETE /api/class/" + req.params.id);
  await DELETE_deleteClass(req, res);
});

// Importa lista de alunos para a turma (arquivo enviado)
router.post("/class/:id/import", upload.single("file"), async (req, res) => {
  console.log(`POST /api/class/${req.params.id}/import`);
  await POST_ImportClass(req, res);
});

// Exporta dados da turma
router.get("/class/:classId/subject/:subjectId/export", async (req, res) => {
  console.log(`GET /api/class/${req.params.classId}/subject/${req.params.subjectId}/export`);
  await GET_ExportClass(req, res);
});

// ======================================================================
// DISCIPLINAS
// ======================================================================

// Cria uma disciplina
router.post("/subject", async (req, res) => {
  console.log("POST /api/subject/");
  await POST_CreateSubject(req, res);
});

// Atualiza uma disciplina
router.put("/subject/:subject_id", async (req, res) => {
  console.log("PUT /api/subject/" + req.params.subject_id);
  await PUT_UpdateSubject(req, res);
});

// remove uma disciplina
router.delete("/subject/:subject_id", async (req, res) => {
  console.log("DELETE /api/subject/" + req.params.subject_id);
  await DELETE_DeleteSubject(req, res);
});

// ======================================================================
// PROFESSOR
// ======================================================================

// Mostra o usuário logado
router.get("/profile", async (req, res) => {
  console.log("GET /api/profile");
  await getCurrentUser(req, res);
});

// Atualiza dados do professor
router.put("/professor/:prof_id", async (req, res) => {
  console.log("PUT /api/professor/" + req.params.prof_id);
  await UPDATE_professor(req, res);
});

// ======================================================================
// ALUNOS
// ======================================================================

// Adiciona aluno à turma
router.post("/student/:classId", async (req, res) => {
  console.log("POST /api/student/" + req.params.classId);
  await insertStudent(req, res);
});

// Lista aluno à turma
router.get("/students/:classId", async (req, res) => {
  console.log("GET /api/students/" + req.params.classId);
  await listStudents(req, res);
});

// Remove aluno à turma
router.delete("/student/:classId/:registration_id", async (req, res) => {
  console.log("DELETE /api/student/" + req.params.classId);
  await removeStudent(req, res);
});

// Atualiza aluno à turma
router.put("/student/:id", async (req, res) => {
  console.log("PUT /api/student/" + req.params.id);
  await updateStudentController(req, res);
});

// ======================================================================
// NOTAS
// ======================================================================

// Atualizar notas dos componentes
router.post("/subject/:subjectId/grades", async (req, res) => {
  console.log(`POST /api/subject/${req.params.subjectId}/grades`);
  await PUT_UpdateScoreController(req, res);
});

// Listar todas as notas da turma em uma disciplina
router.get("/class/:classId/subject/:subjectId/grades", async (req, res) => {
  console.log(
    `GET /api/class/${req.params.classId}/subject/${req.params.subjectId}/grades`
  );
  await GET_ListGradesController(req, res);
});

// Lista componentes avaliativos de uma disciplina
router.get("/subject/:subjectId/components", async (req, res) => {
  console.log(`GET /api/subject/${req.params.subjectId}/components`);
  await GET_GetComponentsBySubject(req, res);
});

// Criar um componente da disciplina
router.post("/subject/:subjectId/component", async (req, res) => {
  console.log(`POST /api/subject/${req.params.subjectId}/component`);
  await POST_AddComponent(req, res);
});

// Atualiza componente
router.put("/component/:componentId", async (req, res) => {
  console.log(`PUT /api/component/${req.params.componentId}`);
  await PUT_UpdateComponent(req, res);
});

// Remove componente
router.delete("/component/:componentId", async (req, res) => {
  console.log("DELETE /api/component/" + req.params.componentId);
  await DELETE_DeleteComponent(req, res);
});

// Fórmula final da disciplina
router.get("/subject/:subjectId/final-formula", async (req, res) => {
  console.log(`GET /api/subject/${req.params.subjectId}/final-formula`);
  await GET_FinalFormulaController(req, res);
});

// Atualiza fórmula final
router.post("/subject/:subjectId/final-formula", async (req, res) => {
  console.log(`POST /api/subject/${req.params.subjectId}/final-formula`);
  await POST_UpdateFinalFormulaController(req, res);
});

// Criar grade (associar aluno à disciplina)
router.post("/grade", async (req, res) => {
  console.log(`POST /api/grade`);
  await POST_AddGrade(req, res);
});

export default router;
