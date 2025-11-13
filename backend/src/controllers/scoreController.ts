//Autores: Emilly Morelatto e Mateus Campos
import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
    updateScoreService,
    listScoreService,
    defineFormulaService,
    calculateFinalGradesService
} from "../services/scoreService";

// Chama a Função que adiciona/modifica a nota de um aluno

export async function updateScoreController(req: Request, res: Response) {
    console.log("\n[updateScoreController] Requisição recebida");
    try {
        const { class_id, componentId } = req.params;
        if (!class_id || !componentId) throw new AppError(400, "Parâmetros ausentes.");
        const notas = req.body;

        const result = await updateScoreService(class_id, componentId, notas);
        return res.status(200).json(result);
    } catch (err: any) {
        console.error("[updateScoreController] Erro:", err);
        if (err instanceof AppError)
            return res.status(err.code).json({ error: err.message });
        return res.status(500).json({ error: "Unexpected Error" });
    }
}

// Chama a Função para exibir uma lista com os nomes dos alunos juntamente de suas notas

export async function listGradesController(req: Request, res: Response) {
    console.log("\n[listGradesController] Listando notas");
    try {
        const { class_id } = req.params;
        if (!class_id) throw new AppError(400, "class_id ausente.");

        const result = await listScoreService(class_id);
        return res.status(200).json(result);
    } catch (err: any) {
        console.error("[listGradesController] Erro:", err);
        if (err instanceof AppError)
            return res.status(err.code).json({ error: err.message });
        return res.status(500).json({ error: "Unexpected Error" });
    }
}

// Chama a Função para que o professor adicione a fórmula de cálculo de sua nota

export async function defineFormulaController(req: Request, res: Response) {
    console.log("\n[defineFormulaController] Definindo fórmula");
    try {
        const { subject_id } = req.params;
        if (!subject_id) throw new AppError(400, "subject_id ausente.");

        const formula = req.body;
        const result = await defineFormulaService(subject_id, formula);
        return res.status(200).json(result);
    } catch (err: any) {
        console.error("[defineFormulaController] Erro:", err);
        if (err instanceof AppError)
            return res.status(err.code).json({ error: err.message });
        return res.status(500).json({ error: "Unexpected Error" });
    }
}

// Chama a Função que calcula a média final do aluno

export async function calculateFinalGradesController(req: Request, res: Response) {
    console.log("\n[calculateFinalGradesController] Calculando notas finais");
    try {
        const { class_id } = req.params;
        if (!class_id) throw new AppError(400, "class_id ausente.");

        const result = await calculateFinalGradesService(class_id);
        return res.status(200).json(result);
    } catch (err: any) {
        console.error("[calculateFinalGradesController] Erro:", err);
        if (err instanceof AppError)
            return res.status(err.code).json({ error: err.message });
        return res.status(500).json({ error: "Unexpected Error" });
    }
}
