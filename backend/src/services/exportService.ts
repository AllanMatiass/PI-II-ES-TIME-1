// Autor: Emilly Morelatto
import { DatabaseClient } from "../db/DBClient";
import { AppError } from "../errors/AppError";

const db = new DatabaseClient();
const classStudentsTable = db.table("class_students");
const studentsTable = db.table("students");
const gradesTable = db.table("grades");
const componentsTable = db.table("grade_components");

// Busca dados e verifica se as notas estão completas
export async function getClassGradesForExport(classId: string) {
    const classStudents =await classStudentsTable.findMany({ class_id: classId });
    if(!classStudents||classStudents.length===0)
    {
        throw new AppError(400, "Nenhum aluno encontrado nessa turma");
    }
    const formattedData = [];

    for (const cs of classStudents) {

        const student = await studentsTable.findUnique({ id: cs.student_id });
        const grade = await gradesTable.findUnique({ id: cs.grade_id });

        if (!student || !grade) continue;

        const component = await componentsTable.findUnique({ id: grade.grade_component_id });

        // Se alguma nota estiver faltando, sendo nula, indefinidada ou vazia, a exportação é bloqueada
        if (grade.automatic_final_grade === null ||grade.automatic_final_grade === undefined ||grade.automatic_final_grade === "-") 
        {
            throw new AppError(400, "Erro, está faltando nota!"); 
        }
        // Monta um objeto contendo os dados do aluno, componente e nota já prontos para exportação, e adiciona no array formattedData
        formattedData.push({registration_id: student.registration_id,student_name: student.name,component_name: component?.name ?? "Componente",grade: grade.automatic_final_grade});
    }
}

// Converte para CSV sem salvar no servidor
export function generateCSVBuffer(data: any[]) {
    let csv = "Matrícula,Aluno,Componente,Nota\n"; 

    data.forEach(row => {
        csv += `${row.registration_id},${row.student_name},${row.component_name},${row.grade}\n`;
    });

    return csv;
}