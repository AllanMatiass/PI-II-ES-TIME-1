//autores: Emilly Morelatto e Mateus Campos
import { ClassStudentsDataModel, GradeComponentDataModel, GradeDataModel, StudentDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { AppError } from "../errors/AppError";
import { ScoreRequestDTO, ScoreResponseDto } from "dtos";

const db = new DatabaseClient();
const gradesTable = db.table<GradeDataModel>("grades");
const componentsTable = db.table<GradeComponentDataModel>("grade_components");
const studentsTable = db.table<StudentDataModel>("students");
const classStudentsTable = db.table<ClassStudentsDataModel>("class_students");

// ============================================================
// 1. Update Score (apenas média simples)
// ============================================================

export async function updateScoreService(subjectId: string, notas: ScoreRequestDTO) {
    if (!Array.isArray(notas.scores) || notas.scores.length === 0) {
        throw new AppError(400, "Nenhuma nota enviada.");
    }

    let response: ScoreResponseDto[]  = [];
    for (const nota of notas.scores) {
        const { student_id, component_id, grade_value } = nota;

        const parsed = Math.min(Math.max(Number(grade_value) || 0, 0), 10);

        const component = await componentsTable.findUnique({ id: component_id });
        if (!component || component.subject_id !== subjectId) {
            throw new AppError(400, "Componente inválido para esta disciplina.");
        }

        const data = {
            student_id,
            subject_id: subjectId,
            grade_value: grade_value,
            automatic_final_grade: parsed,
            entry_date: new Date()
        }

        await gradesTable.insert(data);

        response.push(data);

    }

    return response;
}



// ============================================================
// 2. Lista de notas por aluno
// ============================================================

export async function listScoreService(classId: string, subjectId: string) {
    
    const classStudents = await classStudentsTable.findMany({ class_id: classId });
    if (!classStudents.length) {
        throw new AppError(404, "Nenhum aluno encontrado nesta turma.");
    }

    const components = await componentsTable.findMany({ subject_id: subjectId });

    const result = [];

    for (const cs of classStudents) {

        const student = await studentsTable.findUnique({ id: cs.student_id });
        if (!student) continue;

        const detailed = [];

        for (const comp of components) {

            let grade = null;
            if (comp.grade_id) {
                grade = await gradesTable.findUnique({ id: comp.grade_id });
            }

            detailed.push({
                component_name: comp.name,
                formula_acronym: comp.formula_acronym,
                grade_value: grade?.grade_value ?? null,
                final_grade: grade?.automatic_final_grade ?? null
            });
        }

        result.push({
            student_id: student.id,
            student_name: student.name,
            registration_id: student.registration_id,
            grades: detailed
        });
    }

    return result;
}

export async function calculateFinalGradesService(subjectId: string) {

    const components = await componentsTable.findMany({ subject_id: subjectId });
    if (!components.length) {
        throw new AppError(404, "Nenhum componente encontrado.");
    }

    const updated = [];

    // Junta valores por grade_id (pois todos componentes do aluno apontam para o mesmo grade_id)
    const gradesByGradeId = new Map<string, number[]>();

    for (const comp of components) {

        if (!comp.grade_id) continue;

        const grade = await gradesTable.findUnique({ id: comp.grade_id });
        if (!grade) continue;

        if (!gradesByGradeId.has(comp.grade_id)) {
            gradesByGradeId.set(comp.grade_id, []);
        }

        gradesByGradeId.get(comp.grade_id)!.push(grade.grade_value);
    }

    // Agora, calcular a média de cada grade_id (cada aluno)
    for (const [gradeId, values] of gradesByGradeId.entries()) {

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = values.length ? sum / values.length : 0;

        const rounded = Math.round(avg * 100) / 100;

        // Atualiza o registro Grade correto
        await gradesTable.update(
            {
                automatic_final_grade: rounded
            },
            {
                id: gradeId
            }
        );

        const grade = await gradesTable.findUnique({ id: gradeId });

        updated.push({
            student_id: grade!.student_id,
            final_grade: rounded
        });
    }

    return { message: "Média simples calculada com sucesso!", updated };
}
