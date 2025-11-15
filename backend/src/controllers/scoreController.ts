//Autores: Emilly Morelatto e Mateus Campos
import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import {
  updateScoreService,
  listScoreService,
  calculateFinalGradesService,
  addComponentService,
  addGradeService,
  getGradeById
} from "../services/scoreService";
import { GradeComponentRequestDTO, ScoreRequestDTO } from "dtos";

export async function updateScoreController(req: Request, res: Response) {
  console.log("\n=== [updateScoreController] Requisição recebida ===");
  try {
    const { subjectId } = req.params;

    if (!subjectId ) {
      throw new AppError(400, 'Params must contain the following url model: /class/:classId/grades');
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

export async function addComponent(req: Request, res: Response) {
    try {
        const studentId = req.params.studentId;
        const data = req.body as GradeComponentRequestDTO;

        if (!studentId){
          throw new AppError(404, 'Student not found.');
        }

        const result = await addComponentService(studentId, data);

        return res.status(201).json(result);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.code).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

export async function addGrade(req: Request, res: Response) {
    try {
        const { student_id, subject_id, grade_value } = req.body;

        const gradeId = await addGradeService({
            student_id,
            subject_id,
            grade_value
        });
        
        if (!gradeId) throw new AppError(500, 'Erro interno do servidor.');
        const result = await getGradeById(gradeId.grade);

        return res.status(201).json(result);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.code).json({ error: error.message });
        }
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}