import { ProfessorDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { ProfessorResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";

const db = new DatabaseClient();
const professorsTable = db.table<ProfessorDataModel>('professors');


export async function updateProfessor(_id: string, update: Partial<ProfessorDataModel>) : Promise<ProfessorResponseDTO> {
    const professorExist = await professorsTable.findUnique({id:_id});
    if (!professorExist) throw new AppError(404, 'ID not found.');

    const updateData = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
    ) as Partial<ProfessorDataModel>;

    await professorsTable.update(updateData, { id:_id });
    const {id, name, email, phone, created_at} = await professorsTable.findUnique({ id:_id }) as ProfessorResponseDTO;
    return {id, name, email, phone, created_at}
}
