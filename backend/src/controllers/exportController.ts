// Autor: Emilly Morelatto
import { Request, Response } from "express";
import { getClassGradesForExport, generateCSVBuffer } from "../services/exportService";

export async function exportClassCSVController(req: Request, res: Response) {
    try {
        const { classId } = req.params;

        // Busca as notas da turma + verifica se está completa
        const data = await getClassGradesForExport(classId);

        // Se retornar null, quer dizer que existe nota faltando
        if (data === null) {
            return res.status(400).json({
                message: "Não é possível exportar. Existem notas pendentes para esta turma."
            });
        }

        // Gera o CSV na memória 
        const csvBuffer = generateCSVBuffer(data);

        // Gera nome de arquivo no padrão exigido
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `${timestamp}-turma-${classId}.csv`;

        // Define o arquivo para download
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "text/csv");
        return res.send(csvBuffer);

    } catch (err) {
        console.error("Erro ao exportar CSV:", err);
        return res.status(500).json({ message: "Erro interno ao gerar o arquivo." });
    }
}
