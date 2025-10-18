import { InstitutionRegisterRequestDTO, InstitutionResponseDTO } from "dtos";
import { DatabaseClient } from "../db/DBClient";
import { InstitutionDataModel, ProfessorInstitutionDataModel } from "dataModels";

const db: DatabaseClient = new DatabaseClient();
const institutionTable = db.table<InstitutionDataModel>('institutions');
const professorInstitutionTable = db.table<ProfessorInstitutionDataModel>('professor_institutions');

export async function insertInstitution(data: InstitutionRegisterRequestDTO, professorId: string) : Promise<InstitutionResponseDTO> {

    const institutionId: string = await institutionTable.insert(data);
    const res: InstitutionResponseDTO | null = await institutionTable.findUnique({id: institutionId});

    if (!res){
        throw new Error("An internal error ocurred on institution inserting.");
    }

    professorInstitutionTable.insert({
        professor_id: professorId,
        institution_id: institutionId
    })


    return res;
}