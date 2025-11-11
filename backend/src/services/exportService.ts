// Autor: Emilly Morelatto
import { DatabaseClient } from "../db/DBClient";
const db = new DatabaseClient();
// Busca dados e verifica se as notas estão completas
export async function getClassGradesForExport(classId: string) {
    const result = await db.query(
        `
        SELECT 
            s.registration_id,
            s.name AS student_name,
            gc.name AS component_name,
            g.automatic_final_grade AS grade
        FROM class_students cs
        JOIN students s ON cs.student_id = s.id
        JOIN grades g ON cs.grade_id = g.id
        JOIN grade_components gc ON g.grade_component_id = gc.id
        WHERE cs.class_id = $1
        ORDER BY s.name, gc.name
        `,
        [classId]
    );

    // Se existir nota null ou '-' → exportação bloqueada
    const missing = result.rows.some(r =>
        r.grade === null || r.grade === undefined || r.grade === "-"
    );

    if (missing) {
        return null; // Controller entende que exportação deve ser negada
    }

    return result.rows;
}

// Converte para CSV sem salvar no servidor
export function generateCSVBuffer(data: any[]) {
    let csv = "Matrícula,Aluno,Componente,Nota\n"; 

    data.forEach(row => {
        csv += `${row.registration_id},${row.student_name},${row.component_name},${row.grade}\n`;
    });

    return csv;
}
