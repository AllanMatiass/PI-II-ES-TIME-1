// Autor: Cristian Fava

// Importa o tipo do DTO (Data Transfer Object) usado para registrar uma disciplina
import { SubjectRegisterRequestDTO } from "dtos";

// Importa o cliente de banco de dados que abstrai as operações SQL
import { DatabaseClient } from "../db/DBClient";

// Classe responsável por tratar e lançar erros personalizados
import { AppError } from "../errors/AppError";

// Modelos de dados que representam as tabelas "courses" e "subjects"
import { CourseDataModel, SubjectDataModel } from "dataModels";

// Cria uma instância do cliente de banco de dados
const db: DatabaseClient = new DatabaseClient();

// Cria referências para as tabelas do banco
const courseTable = db.table<CourseDataModel>("courses");
const subjectTable = db.table<SubjectDataModel>("subjects");

/**
 * Insere uma nova disciplina (subject) dentro de um curso existente
 */
export async function InsertSubjectInCourse(subjectDto: SubjectRegisterRequestDTO): Promise<SubjectDataModel> {
    // Verifica se o curso informado realmente existe no banco
    const courseExists = await courseTable.findUnique({
        id: subjectDto.course_id
    });

    if (!courseExists) {
        // Caso o curso não exista, lança um erro 404 (não encontrado)
        throw new AppError(404, "Course does'not exists.");
    }

    // Insere a nova disciplina na tabela "subjects" e obtém o ID gerado
    const subjectId: string = await subjectTable.insert(subjectDto as any);

    // Busca a disciplina recém-criada pelo ID
    const subject = await subjectTable.findUnique({
        id: subjectId
    });

    if (!subject) {
        // Caso algo dê errado e o registro não seja encontrado, lança erro interno
        throw new AppError(500, "Internal server error!");
    }

    // Retorna a disciplina criada
    return subject;
}

/**
 * Atualiza uma disciplina existente com base no ID informado
 */
export async function UpdateSubject(id: string, subjectDto: SubjectRegisterRequestDTO) {
    // Verifica se a disciplina realmente existe
    const oldSubject = await subjectTable.findUnique({
        id
    });

    if (!oldSubject) {
        // Caso não exista, lança erro 404
        throw new AppError(404, "Subject does'not exists!");
    }
    
    // Verifica se o curso associado à disciplina existe
    const courseExists = await courseTable.findUnique({
        id: subjectDto.course_id
    });

    if (!courseExists) {
        // Caso o curso não exista, lança erro 404
        throw new AppError(404, "Course does'not exists.");
    }

    // Atualiza o registro da disciplina com os novos dados
    await subjectTable.update(subjectDto , {
        id
    });

    // Retorna verdadeiro para indicar sucesso
    return true;
}

/**
 * Exclui uma disciplina (subject) pelo seu ID
 */
export async function DeleteSubject(id: string) {
    // Verifica se a disciplina existe
    const subjectExists = await subjectTable.findUnique({
        id
    });

    if (!subjectExists) {
        // Caso não exista, lança erro 404
        throw new AppError(404, "Subject does not exits!");
    }

    // Deleta o registro da disciplina
    await subjectTable.deleteMany({
        id
    });

    // Retorna verdadeiro indicando que foi removido com sucesso
    return true;
}

/**
 * Retorna todas as disciplinas associadas a um determinado curso
 */
export async function GetCourseSubjectsByCourseId(course_id: string) {
    // Busca todas as disciplinas cujo campo "course_id" corresponde ao ID informado
    const subjects = await subjectTable.findMany({
        course_id
    });

    // Retorna o array de disciplinas
    return subjects;
}
