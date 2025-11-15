//autores: Emilly Morelatto e Mateus Campos
import { ClassStudentsDataModel, GradeComponentDataModel, GradeDataModel, StudentDataModel, SubjectDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { AppError } from "../errors/AppError";
import { CreateGradeRequestDTO, GradeComponentRequestDTO, ScoreRequestDTO, ScoreResponseDto } from "dtos";

const db = new DatabaseClient();
const gradesTable = db.table<GradeDataModel>("grades");
const componentsTable = db.table<GradeComponentDataModel>("grade_components");
const studentsTable = db.table<StudentDataModel>("students");
const classStudentsTable = db.table<ClassStudentsDataModel>("class_students");
const subjectTable = db.table<SubjectDataModel>('subjects');

// ============================================================
// 1. Update Score (apenas média simples)
// ============================================================

export async function updateScoreService(subjectId: string, notas: ScoreRequestDTO) {
    if (!Array.isArray(notas.scores) || notas.scores.length === 0) {
        throw new AppError(400, "Nenhuma nota enviada.");
    }

    let response: ScoreResponseDto[] = [];

    for (const nota of notas.scores) {
        const { student_id, component_id, grade_value } = nota;

        // Validações básicas
        const studentExist = await studentsTable.findUnique({ id: student_id });
        if (!studentExist) throw new AppError(404, 'Student not found.');

        const component = await componentsTable.findUnique({ id: component_id });
        if (!component) throw new AppError(404, 'Component not found.');

        if (component.subject_id !== subjectId) {
            throw new AppError(400, "Componente inválido para esta disciplina.");
        }

        const grade = await gradesTable.findUnique({ id: component.grade_id });
        if (!grade) throw new AppError(404, "Grade não encontrada.");

        if (grade.student_id !== student_id) {
            throw new AppError(409, "Este componente não pertence a este aluno.");
        }

        // Sanitiza nota
        const parsed = Math.min(Math.max(Number(grade_value) || 0, 0), 10);

        // Atualiza a grade existente
        await componentsTable.update(
            { grade_value: parsed },
            { id: component_id }
        );

        response.push({
            student_id,
            grade_id: component.grade_id,
            grade_component_value: parsed
        });
    }

    // Recalcular médias APÓS todas as notas atualizadas
    await calculateFinalGradesService(subjectId);

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
    
    await calculateFinalGradesService(subjectId);

    for (const cs of classStudents) {
        const student = await studentsTable.findUnique({ id: cs.student_id });
        if (!student) continue;

        const detailed: {
            component_name: string;
            formula_acronym: string;
            grade_value: number;
        }[] = [];

        // Filtra os componentes que pertencem a este aluno
        const studentComponents = components.filter(c => {
            return c.grade_id && gradesTable.findUnique({ id: c.grade_id }).then(g => g?.student_id === student.id);
        });

        // Preenche detalhes e evita duplicações
        const seen = new Set<string>();
        for (const comp of studentComponents) {
            if (seen.has(comp.formula_acronym)) continue;
            seen.add(comp.formula_acronym);

            detailed.push({
                component_name: comp.name,
                formula_acronym: comp.formula_acronym,
                grade_value: Number(comp.grade_value ?? 0)
            });
        }

        // Pega o final_grade do aluno (cada aluno tem 1 grade_id por disciplina)
        const studentGrades = await gradesTable.findUnique({ student_id: student.id, subject_id: subjectId });
        const finalGrade = Number(studentGrades?.automatic_final_grade ?? 0);
        

        result.push({
            student_id: student.id,
            student_name: student.name,
            registration_id: student.registration_id,
            grades: detailed,
            final_grade: finalGrade
        });
    }

    return {
        message: "Grades listed successfully",
        data: result
    };
}

export async function calculateFinalGradesService(subjectId: string) {
    const subjectExist = await subjectTable.findUnique({id: subjectId});
    if (!subjectExist){
        throw new AppError(404, 'Subject not found.');
    }

    const components = await componentsTable.findMany({ subject_id: subjectId });
    if (!components.length) {
        throw new AppError(404, "Nenhum componente encontrado.");
    }

    const updated = [];

    // Junta valores por grade_id (todos componentes do aluno apontam para o mesmo grade_id)
    const gradesByGradeId = new Map<string, number[]>();

    for (const comp of components) {
        if (!comp.grade_id) continue;

        if (!gradesByGradeId.has(comp.grade_id)) {
            gradesByGradeId.set(comp.grade_id, []);
        }

        // Agora pegamos o valor do componente, não do Grade
        gradesByGradeId.get(comp.grade_id)!.push(Number(comp.grade_value ?? 0));
    }

    // Calcular a média de cada grade_id (cada aluno)
    for (const [gradeId, values] of gradesByGradeId.entries()) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = values.length ? sum / values.length : 0;
        const rounded = Math.round(avg * 100) / 100;

        // Atualiza o registro Grade correto
        await gradesTable.update(
            { automatic_final_grade: rounded },
            { id: gradeId }
        );

        // Pega o grade atualizado para retorno
        const grade = await gradesTable.findUnique({ id: gradeId });

        updated.push({
            student_id: grade!.student_id,
            final_grade: rounded
        });
    }

    return { message: "Média simples calculada com sucesso!", updated };
}



export async function addComponentService(studentId: string, data: GradeComponentRequestDTO) {
    
    const { subject_id, name, formula_acronym, description, grade_id, grade_value } = data;

    // Se não vier valor, define como 0.0
    const val = grade_value ?? 0.0;

    // 1. Verifica se a disciplina existe
    const subjectExist = await subjectTable.findUnique({id: subject_id});
    if (!subjectExist){
        throw new AppError(404, 'Subject not found.');
    }

    // 2. Validar se o grade_id existe
    const grade = await gradesTable.findUnique({ id: grade_id });
    if (!grade) {
        throw new AppError(404, "Grade not found.");
    }

    // 3. Validar se o grade_id pertence ao aluno correto
    if (grade.student_id !== studentId) {
        throw new AppError(409, "Este grade_id não pertence ao aluno informado.");
    }

    // 4. Validar se o grade_id é da mesma disciplina
    if (grade.subject_id !== subject_id) {
        throw new AppError(400, "O grade_id informado não pertence a esta disciplina.");
    }

    const gp = await componentsTable.findUnique({formula_acronym});
    if (gp) throw new AppError(409, 'Formula Acronym already exists');

    // 5. Inserir componente
    const createdId = await componentsTable.insert({
        subject_id,
        name,
        formula_acronym,
        description,
        grade_id,
        grade_value: val
    });

    // 6. Buscar componente recém-criado
    const res = await componentsTable.findUnique({ id: createdId });

    if (!res) {
        throw new AppError(500, "Erro inesperado: não foi possível criar o componente.");
    }

    // 7. Normalizar retorno (MySQL DECIMAL → string)
    const response = {
        id: res.id,
        subject_id: res.subject_id,
        name: res.name,
        formula_acronym: res.formula_acronym,
        description: res.description,
        grade_id: res.grade_id,
        grade_value: Number(res.grade_value)
    };

    return {
        message: "Componente criado com sucesso!",
        component: response
    };
}


export async function addGradeService(data: CreateGradeRequestDTO) {

    const { student_id, subject_id, grade_value } = data;

    const studentExist = await studentsTable.findUnique({id: student_id});
    if (!studentExist){
        throw new AppError(404, 'Student not found.');
    }

    const subjectExist = await subjectTable.findUnique({id: subject_id});
    if (!subjectExist){
        throw new AppError(404, 'Subject not found.');
    }

    const gradeAlreadySync = await gradesTable.findUnique({student_id, subject_id});
    if (gradeAlreadySync) throw new AppError(409, 'This grade is already sync with student.');

    // Sanitizar nota (0 → 10)
    const parsed = Math.min(Math.max(Number(grade_value) || 0, 0), 10);

    const created = await gradesTable.insert({
        student_id,
        subject_id,
        grade_value: parsed,
        automatic_final_grade: parsed,
        entry_date: new Date()
    });

    return {
        message: "Nota criada com sucesso!",
        grade: created
    };
}


export async function getGradeById(id: string){

    const grade = await gradesTable.findUnique({id});
    if (!grade) throw new AppError(404, 'Grade not found.');

    return grade;

}