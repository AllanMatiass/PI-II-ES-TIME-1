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

export async function getInstitutionByProfessorId(id: string): Promise<InstitutionWithProfessorsResponseDTO[]> {
  // Verifica se o professor existe
  const professor = await professorTable.findUnique({ id });
  if (!professor) {
    throw new Error(`Professor with id '${id}' not found`);
  }

  // Busca os vínculos do professor com instituições
  const professorInstitutions = await professorInstitutionTable.findMany({ professor_id: id });

  // Para cada vínculo, busca a instituição e seus professores
  const institutionsWithProfessors = await Promise.all(
    professorInstitutions.map(async (pi) => {
      const institution = await institutionTable.findUnique({ id: pi.institution_id });
      if (!institution) return null;

      // Busca todos os professores dessa instituição
      const relatedProfessorInstitutions = await professorInstitutionTable.findMany({ institution_id: institution.id });

      const professors = await Promise.all(
        relatedProfessorInstitutions.map(async (rpi) => {
          const prof = await professorTable.findUnique({ id: rpi.professor_id });
          if (!prof) return null;

          // Converte DataModel → DTO
          const { id, name, phone, email } = prof;
          return { id, name, phone, email } as ProfessorResponseDTO;
        })
      );

      const validProfessors = professors.filter((p): p is ProfessorResponseDTO => p !== null);

      const institutionDTO: InstitutionResponseDTO = { id: institution.id, name: institution.name };

      return {
        institution: institutionDTO,
        professors: validProfessors,
      } as InstitutionWithProfessorsResponseDTO;
    })
  );

  // Filtra instituições nulas (caso alguma não exista)
  return institutionsWithProfessors.filter((i): i is InstitutionWithProfessorsResponseDTO => i !== null);
}