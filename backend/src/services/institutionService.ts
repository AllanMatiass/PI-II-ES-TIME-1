import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO, ProfessorResponseDTO } from "dtos";
import { DatabaseClient } from "../db/DBClient";
import { InstitutionDataModel, ProfessorDataModel, ProfessorInstitutionDataModel } from "dataModels";

const db: DatabaseClient = new DatabaseClient();
const institutionTable = db.table<InstitutionDataModel>('institutions');
const professorInstitutionTable = db.table<ProfessorInstitutionDataModel>('professor_institutions');
const professorTable = db.table<ProfessorDataModel>('professors');

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

export async function getAllInstitutions(): Promise<InstitutionWithProfessorsResponseDTO[]> {
    const institutions = await institutionTable.findMany();

    const institutionProfessors: InstitutionWithProfessorsResponseDTO[] = await Promise.all(
        // Pega cada instituição
        institutions.map(async (inst) => {
            const professorInstitutions = await professorInstitutionTable.findMany({
            institution_id: inst.id,
            });

            //Pega cada professor daquela instituição
            const professors = await Promise.all(
            professorInstitutions.map(async (pi) => {
                const professor = await professorTable.findUnique({ id: pi.professor_id });

                if (!professor) return null;

                // converte DataModel → ResponseDTO
                const {id, name, email, phone, created_at} = professor;
                const dto: ProfessorResponseDTO = {id, name, email, phone, created_at};
                return dto;
            })
            );

            // remove os nulls
            const validProfessors = professors.filter(
                (p): p is ProfessorResponseDTO => p !== null
            );

            // Cria DTO para retornar
            const institutionDTO: InstitutionResponseDTO = {
                id: inst.id,
                name: inst.name,
            };

            return {
                institution: institutionDTO,
                professors: validProfessors,
            };
        })
    );

    return institutionProfessors;
}

export async function getInstitutionById(id: string): Promise<InstitutionWithProfessorsResponseDTO> {
  // Busca a instituição
  const institution = await institutionTable.findUnique({ id });
  if (!institution) {
    throw new Error(`Institution with id '${id}' not found`);
  }

  // Busca os vínculos da instituição com professores
  const professorInstitutions = await professorInstitutionTable.findMany({ institution_id: id });

  // Busca os professores associados
  const professors = await Promise.all(
    professorInstitutions.map(async (pi) => {
      const professor = await professorTable.findUnique({ id: pi.professor_id });
      if (!professor) return null;

      // converte DataModel → DTO
      const { id, name, phone, email, created_at } = professor;
      const dto: ProfessorResponseDTO = { id, name, phone, email, created_at };
      return dto;
    })
  );

  // Filtra nulls e garante tipagem
  const validProfessors = professors.filter(
    (p): p is ProfessorResponseDTO => p !== null
  );

  // Converte instituição para DTO
  const institutionDTO: InstitutionResponseDTO = {
    id: institution.id,
    name: institution.name,
  };

  // Retorna no formato esperado
  return {
    institution: institutionDTO,
    professors: validProfessors,
  };
}