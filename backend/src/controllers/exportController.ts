// Autor: Emilly Morelatto
import { Request, Response } from "express";
import { getClassGradesForExport, generateCSVBuffer } from "../services/exportService";
import { AppError } from "../errors/AppError";

export async function exportClassCSVController(req: Request, res: Response) {
    try {
        const { classId } = req.params;

        // Busca as notas da turma + verifica se está completa
        const data = await getClassGradesForExport(classId);
        // Gera CSV em memória 
        const csvBuffer = generateCSVBuffer(data);
        
        // Gera nome do arquivo baseado na data
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `${timestamp}-turma-${classId}.csv`;

        // Configura o download
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "text/csv");

        return res.send(csvBuffer);

    } catch (err: any) {

       
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }
        console.error("Erro inesperado ao exportar CSV:", err);
        return res.status(500).json({ error: "Unexpected Error" });
    }
}
