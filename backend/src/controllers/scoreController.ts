//Autores: Emilly Morelatto e Mateus Campos
import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  updateScoreService,
  listScoreService,
  defineFormulaService,
  calculateFinalGradesService,
} from "../services/scoreService";

export async function updateScoreController(req: Request, res: Response) {
  console.log("\n=== [updateScoreController] Requisição recebida ===");
  try {
    const { class_id, componentId } = req.params;
    const notas = req.body;

    const result = await updateScoreService(class_id, componentId, notas);

    console.log("[updateScoreController] Notas processadas com sucesso!");
    return res
      .status(200)
      .json({ message: "Grades successfully submitted", data: result });
  } catch (err: any) {
    console.error("[updateScoreController] Erro:", err);

    if (err instanceof AppError) {
      return res.status(err.code).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unexpected Error" });
  }
}

export async function listGradesController(req: Request, res: Response) {
  console.log("\n=== [listGradesController] Listando notas ===");
  try {
    const { class_id } = req.params;

    const result = await listScoreService(class_id);

    console.log("[listGradesController] Listagem concluída!");
    return res.status(200).json({
      message: "Grades listed successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("[listGradesController] Erro:", err);

    if (err instanceof AppError) {
      return res.status(err.code).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unexpected Error" });
  }
}

export async function defineFormulaController(req: Request, res: Response) {
  console.log("\n=== [defineFormulaController] Definindo fórmula ===");
  try {
    const { subject_id } = req.params;
    const formula = req.body;

    const result = await defineFormulaService(subject_id, formula);

    console.log("[defineFormulaController] Fórmula registrada com sucesso!");
    return res.status(200).json({
      message: "Formula was defined successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("[defineFormulaController] Erro:", err);

    if (err instanceof AppError) {
      return res.status(err.code).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unexpected Error" });
  }
}

export async function calculateFinalGradesController(req: Request, res: Response) {
  console.log("\n=== [calculateFinalGradesController] Calculando notas finais ===");
  try {
    const { class_id } = req.params;

    const result = await calculateFinalGradesService(class_id);

    console.log("[calculateFinalGradesController] Cálculo concluído!");
    return res.status(200).json({
      message: "Final grades calculated successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("[calculateFinalGradesController] Erro:", err);

    if (err instanceof AppError) {
      return res.status(err.code).json({ error: err.message });
    }

    return res.status(500).json({ error: "Unexpected Error" });
  }
}