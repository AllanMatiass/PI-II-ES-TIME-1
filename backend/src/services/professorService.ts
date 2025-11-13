// Autor: Allan Giovanni Matias Paes
import { ProfessorDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { ProfessorResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";

// cria instância do banco
const db = new DatabaseClient();
// tabela de professores
const professorsTable = db.table<ProfessorDataModel>('professors');

export async function updateProfessor(_id: string, update: Partial<ProfessorDataModel>) : Promise<ProfessorResponseDTO> {

    // verifica se o professor existe pelo id
    const professorExist = await professorsTable.findUnique({id:_id});
    if (!professorExist) throw new AppError(404, 'ID not found.');

    // remove campos undefined do objeto de atualização
    const updateData = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
    ) as Partial<ProfessorDataModel>;

    // atualiza o professor no banco
    await professorsTable.update(updateData, { id:_id });

    // busca novamente para retornar os dados atualizados
    const {id, name, email, phone, created_at} = await professorsTable.findUnique({ id:_id }) as ProfessorResponseDTO;

    // retorna somente os campos necessários
    return {id, name, email, phone, created_at}
}