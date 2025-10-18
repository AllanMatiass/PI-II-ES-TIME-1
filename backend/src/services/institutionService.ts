import { InstitutionRegisterRequestDTO, InstitutionResponseDTO } from "dtos";
import { DatabaseClient } from "../db/DBClient";
import { InstitutionDataModel } from "dataModels";

const db: DatabaseClient = new DatabaseClient();
const institutionTable = db.table<InstitutionDataModel>('institutions');


export async function insertInstitution(data: InstitutionRegisterRequestDTO) : Promise<InstitutionResponseDTO> {

    const institutionId: string = await institutionTable.insert(data);
    const res: InstitutionResponseDTO | null = await institutionTable.findUnique({id: institutionId});

    if (!res){
        throw new Error("An internal error ocurred on institution inserting.");
    }

    return res;
}