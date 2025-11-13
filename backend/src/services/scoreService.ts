//autores: Emilly Morelatto e Mateus Campos
import { DatabaseClient } from "../db/DBClient";
import { AppError } from "../errors/AppError";
import crypto from "crypto";

const db = new DatabaseClient();
const gradesTable = db.table("grades");
const componentsTable = db.table("grade_components");
const studentsTable = db.table("students");
const classStudentsTable = db.table("class_students");

interface NotaInput {
    student_id: string;
    grade_value: number;
}

// Função que adiciona/modifica a nota de um aluno

export async function updateScoreService(classId: string, componentId: string, notas: NotaInput[]) {
    console.log("\n=== [updateScoreService] Iniciando atualização de notas ===");

    if (!Array.isArray(notas) || notas.length === 0) {
        throw new AppError(400, "Nenhuma nota enviada.");
    }

    for (const nota of notas) {
        const { student_id, grade_value } = nota;
        console.log(`→ Processando aluno ${student_id} com nota ${grade_value}`);

        let parsedScore = Number(grade_value);
        if (isNaN(parsedScore) || parsedScore < 0) parsedScore = 0;
        if (parsedScore > 10) parsedScore = 10;

        const existing = await gradesTable.findMany({
            student_id,
            grade_component_id: componentId,
            class_id: classId
        });

        if (!existing || existing.length === 0) {
            await gradesTable.insert({
                id: crypto.randomUUID(),
                student_id,
                grade_component_id: componentId,
                class_id: classId,
                grade_value: parsedScore,
                automatic_final_grade: parsedScore,
                entry_date: new Date()
            });
        } else {
            const gradeId = existing[0]?.id;
            if (gradeId) {
                await gradesTable.update(gradeId, {
                    grade_value: parsedScore,
                    automatic_final_grade: parsedScore,
                    entry_date: new Date()
                });
            }
        }
    }

    console.log("[updateScoreService] Notas atualizadas com sucesso!");
    return { message: "Notas atualizadas com sucesso!" };
}

// Função para exibir uma lista com os nomes dos alunos juntamente de suas notas

export async function listScoreService(classId: string) {
    console.log("\n=== [listScoreService] Listando notas da turma ===");

    const classStudents = await classStudentsTable.findMany({ class_id: classId });
    if (!classStudents || classStudents.length === 0) {
        throw new AppError(404, "Nenhum aluno encontrado nesta turma.");
    }

    const result: any[] = [];

    for (const cs of classStudents) {
        const student = await studentsTable.findUnique({ id: cs.student_id });
        if (!student) continue;

        const grades = await gradesTable.findMany({
            student_id: cs.student_id,
            class_id: classId
        });

        const detailedGrades = [];
        for (const g of grades) {
            const component = await componentsTable.findUnique({ id: g.grade_component_id });
            detailedGrades.push({
                component_name: component?.name ?? "Componente desconhecido",
                grade_value: g.grade_value,
                final_grade: g.automatic_final_grade
            });
        }

        result.push({
            student_id: student.id,
            student_name: student.name,
            registration_id: student.registration_id,
            grades: detailedGrades
        });
    }

    console.log(`[listScoreService] Listagem concluída. Total de alunos: ${result.length}`);
    return result;
}

// Função para que o professor adicione a fórmula de cálculo de sua nota

export async function defineFormulaService(subjectId: string, formula: Record<string, number>) {
    console.log("\n=== [defineFormulaService] Definindo fórmula ===");

    if (!formula || Object.keys(formula).length === 0) {
        throw new AppError(400, "Fórmula inválida ou vazia.");
    }

    for (const [acronym, weight] of Object.entries(formula)) {
        const component = await componentsTable.findMany({
            subject_id: subjectId,
            formula_acronym: acronym
        });

        if (!component || component.length === 0) {
            console.warn(`[defineFormulaService] Nenhum componente encontrado: ${acronym}`);
            continue;
        }

        const compId = component[0]?.id;
        if (compId) {
            await componentsTable.update(compId, {
                description: `Peso ${weight}`
            });
        }
    }

    console.log("[defineFormulaService] Fórmula registrada com sucesso!");
    return { message: "Fórmula registrada com sucesso!", formula };
}

// Função que calcula a média final do aluno

export async function calculateFinalGradesService(classId: string) {
    console.log("\n=== [calculateFinalGradesService] Calculando notas finais ===");

    const classStudents = await classStudentsTable.findMany({ class_id: classId });
    if (!classStudents || classStudents.length === 0) {
        throw new AppError(404, "Nenhum aluno encontrado nesta turma.");
    }

    const updated: any[] = [];

    for (const cs of classStudents) {
        const grades = await gradesTable.findMany({
            student_id: cs.student_id,
            class_id: classId
        });

        if (!grades || grades.length === 0) continue;

        let weightedSum = 0;
        let totalWeight = 0;

        for (const g of grades) {
            const component = await componentsTable.findUnique({ id: g.grade_component_id });
            if (!component) continue;

            const match = component.description?.match(/Peso\s*([\d.]+)/);
            const weight = match ? parseFloat(match[1]) : 1;

            weightedSum += (Number(g.grade_value) || 0) * weight;
            totalWeight += weight;
        }

        const finalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

        for (const g of grades) {
            await gradesTable.update(g.id, {
                automatic_final_grade: Math.round(finalGrade * 100) / 100
            });
        }

        updated.push({ student_id: cs.student_id, final_grade: finalGrade });
    }

    console.log("[calculateFinalGradesService] Cálculo de notas finais concluído!");
    return { message: "Cálculo de notas finais concluído!", updated };
}
