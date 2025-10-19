// Autor: Allan Giovanni Matias Paes
import { InstitutionRegisterRequestDTO, InstitutionResponseDTO, InstitutionWithProfessorsResponseDTO, ProfessorResponseDTO } from "dtos";
import { DatabaseClient } from "../db/DBClient";
import { InstitutionDataModel, ProfessorDataModel, ProfessorInstitutionDataModel } from "dataModels";
import { AppError } from "../errors/AppError";

const db: DatabaseClient = new DatabaseClient();
const institutionTable = db.table<InstitutionDataModel>('institutions');
const professorInstitutionTable = db.table<ProfessorInstitutionDataModel>('professor_institutions');
const professorTable = db.table<ProfessorDataModel>('professors');

// Insere professor em uma instituição
export async function insertProfessorInInstitution(professorId: string, institutionId: string) : Promise<InstitutionResponseDTO> {

    // Verifica se professor existe, se não existir, lança erro.
    const professorExist = await professorTable.findUnique({id: professorId});
    if (!professorExist) {
        throw new AppError(404, 'Professor doesnt exist');
    }
    // Verifica se instituição existe, se não existir, lança erro.
    const institutionExist = await institutionTable.findUnique({id: institutionId});
    if (!institutionExist) {
        throw new AppError(404, 'Institution doesnt exist');
    }

    // Verifica se já estão relacionados, se já estiverem, lança erro de conflito.
    const relationshipAlreadyExist = await professorInstitutionTable.findUnique({professor_id: professorId, institution_id: institutionId});
    if (relationshipAlreadyExist){
        throw new AppError(409, 'This professor is already inserted in this institution.');
    }

    // insere o professor aquela instituição via tabela de relacionamento
    const professorInstitutionId = await professorInstitutionTable.insert({professor_id: professorId, institution_id: institutionId})
    const res: InstitutionResponseDTO | null = await institutionTable.findUnique({id: institutionId});

    // se não tiver dados, lança erro inesperado
    if (!res || !professorInstitutionId){
        throw new AppError(500, "An internal error ocurred during the institution inserting.");
    }

    return res;
}

// Insere uma instituição na DB
export async function insertInstitution(data: InstitutionRegisterRequestDTO, professorId: string) : Promise<InstitutionResponseDTO> {

    // insere a instituição e pega o ID
    const institutionId: string = await institutionTable.insert(data);
    // pega a instituição inserida
    const res: InstitutionResponseDTO | null = await institutionTable.findUnique({id: institutionId});

    // Se não tiver, algum erro interno aconteceu.
    if (!res){
        throw new AppError(500, "An internal error ocurred on institution inserting.");
    }

    insertProfessorInInstitution(professorId, institutionId);
    return res;
}

// pega todas as instituições
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
    throw new AppError(404, `Institution with id '${id}' not found`);
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
    throw new AppError(404, `Professor with id '${id}' not found`);
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

      // pega apenas os professores que não são nulos
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

// atualiza uma instituição
export async function updateInstitution(id:string, data: InstitutionRegisterRequestDTO): Promise<InstitutionWithProfessorsResponseDTO> {
  // inicialmente, pega uma instituição pelo ID
  let institutionProfessor = await getInstitutionById(id);

  // se não tiver dados dá um warn no console
  if (!data || !data.name){
    console.warn('No data received.');
  }

  // se tiver o 'name' na requisição e for diferente do nome da instituição atual
  if (data.name && data.name !== institutionProfessor.institution.name){
    await institutionTable.update(data, {id});
    institutionProfessor = await getInstitutionById(id);
  }

  return institutionProfessor;
}

// Deleta uma instituição pelo ID
export async function deleteInstitution(id:string) {

  // Se não encontrar a instituição pelo ID, retorna erro 404.
  if(!await getInstitutionById(id)){
    throw new AppError(404, 'Institution ID not found.');
  }

  // se encontrar, deleta.
  await institutionTable.deleteMany({id});
}
