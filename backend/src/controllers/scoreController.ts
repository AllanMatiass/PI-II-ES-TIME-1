//Autores: Emilly Morelatto e Mateus Campos
import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  updateScoreService,
  listScoreService,
  calculateFinalGradesService
} from "../services/scoreService";
import { ScoreRequestDTO } from "dtos";

export async function updateScoreController(req: Request, res: Response) {
  console.log("\n=== [updateScoreController] Requisição recebida ===");
  try {
    const { subjectId, componentId } = req.params;

    if (!subjectId || !componentId) {
      throw new AppError(400, 'Params must contain the following url model: /class/:classId/grades/:componentId');
    }

    const { scores } = req.body as ScoreRequestDTO;

    const result = await updateScoreService(subjectId, { scores });

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
    const { classId, subjectId } = req.params;

    if (!classId || !subjectId) {
      throw new AppError(400, 'Params must follow this structure: class/:classId/:subjectId/grades.');
    }

    const result = await listScoreService(classId, subjectId);

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

export async function calculateFinalGradesController(req: Request, res: Response) {
  console.log("\n=== [calculateFinalGradesController] Calculando notas finais ===");
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      throw new AppError(400, 'Params must contain subjectId.');
    }

    const result = await calculateFinalGradesService(subjectId);

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