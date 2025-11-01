// Autor: Cristian Fava

// Importa os tipos básicos do Express para manipular requisições (Request) e respostas (Response)
import { Request, Response } from 'express';

// Classe usada para lançar erros personalizados com código HTTP e mensagem
import { AppError } from '../errors/AppError';

// Importa o tipo de dados (DTO) usado nas operações de criação/atualização de disciplinas
import { SubjectRegisterRequestDTO } from 'dtos';

// Importa as funções de serviço que realizam as operações no banco de dados
import { DeleteSubject, GetCourseSubjectsByCourseId, InsertSubjectInCourse, UpdateSubject } from '../services/subjectService';

/**
 * Função auxiliar responsável por validar o corpo da requisição de criação ou atualização de disciplina.
 * Caso algo esteja incorreto, lança um AppError com código 400 (Bad Request).
 */
const CheckValidRegisterBody = async (body: SubjectRegisterRequestDTO): Promise<boolean> => {
    // Verifica se o ID do curso é uma string válida
    if (!body.course_id || typeof body.course_id !== 'string') {
        throw new AppError(400, 'Subject must have a valid course id.');
    }

    // Verifica se o nome da disciplina é uma string válida
    if (!body.name || typeof body.name !== 'string') {
        throw new AppError(400, 'Subject name must be a valid text.');
    }

    // Verifica se o código da disciplina é uma string válida
    if (!body.code || typeof body.code !== 'string') {
        throw new AppError(400, 'Subject code must be a valid text.');
    }

    // Verifica se o acrônimo da disciplina é uma string válida
    if (!body.acronym || typeof body.acronym !== 'string') {
        throw new AppError(400, 'Subject acronym must be a valid text.');
    }

    // Verifica se o período é um número válido maior que 0
    if (!body.period || typeof body.period !== 'number') {
        throw new AppError(400, 'Subject period must be a valid number bigger than 0.');
    }

    // Verifica se a data de início é válida
    if (!body.start_date || isNaN(new Date(body.start_date).getTime())) {
        throw new AppError(400, 'Subject must have a valid start date.');
    }

    // Verifica se a data de término é válida
    if (!body.end_date || isNaN(new Date(body.end_date).getTime())) {
        throw new AppError(400, 'Subject must have a valid end date.');
    }

    // Verifica se o ID do professor associado é uma string válida
    if (!body.professor_institution_id || typeof body.professor_institution_id !== 'string') {
        throw new AppError(400, 'Subject must have a valid professor institution id.');
    }

    // Se passou em todas as verificações, retorna true
    return true;
};

/**
 * Controlador responsável por criar uma nova disciplina.
 * Recebe os dados via corpo da requisição e chama o serviço de inserção.
 */
export async function POST_CreateSubject(req: Request, res: Response) {
    // Converte o corpo da requisição para o tipo esperado (DTO)
    const body = req.body as SubjectRegisterRequestDTO;

    try {
        // Valida os dados enviados
        await CheckValidRegisterBody(body);

        // Insere a disciplina no banco e obtém o objeto criado
        const subject = await InsertSubjectInCourse(body);

        // Retorna sucesso com a disciplina criada
        return res.status(200).json({
            message: "Subject created successfully!",
            data: subject
        });

    } catch (err: any) {
        // Se for um erro controlado (AppError), retorna o código e a mensagem apropriada
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        // Caso contrário, loga o erro e retorna um erro genérico
        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}

/**
 * Controlador responsável por listar todas as disciplinas associadas a um curso.
 * O ID do curso é recebido como parâmetro na rota.
 */
export async function GET_GetCourseSubjects(req: Request, res: Response) {
    try {
        // Obtém o parâmetro "course_id" da URL
        const couseId = req.params["course_id"];

        // Se o parâmetro não for fornecido, lança erro 400
        if (!couseId) {
            throw new AppError(400, "Missing param course id!");
        }

        // Busca as disciplinas do curso informado
        const subjects = await GetCourseSubjectsByCourseId(couseId);

        // Retorna sucesso com a lista encontrada
        return res.status(200).json({
            message: "Found course subjects successfully!",
            data: subjects
        });
    } catch (err: any) {
        // Tratamento de erro padronizado
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}

/**
 * Controlador responsável por atualizar uma disciplina existente.
 * Recebe o ID da disciplina via parâmetro e os novos dados no corpo da requisição.
 */
export async function PUT_UpdateSubject(req: Request, res: Response) {
    try {
        // Obtém o ID da disciplina dos parâmetros da URL
        const subjectId = req.params["subject_id"];

        // Obtém o corpo da requisição e o converte para o tipo esperado
        const body: SubjectRegisterRequestDTO = req.body;

        // Se o ID não for informado, lança erro 400
        if (!subjectId) {
            throw new AppError(400, "Missing param subject_id!");
        }

        // Valida os novos dados informados
        await CheckValidRegisterBody(body);

        // Atualiza a disciplina no banco
        const subject = await UpdateSubject(subjectId, body);

        // Retorna sucesso com a confirmação
        return res.status(200).json({
            message: "Subject updated successfully!",
            data: subject
        });
    } catch (err: any) {
        // Tratamento de erro padronizado
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}

/**
 * Controlador responsável por deletar uma disciplina.
 * Recebe o ID da disciplina como parâmetro da rota.
 */
export async function DELETE_DeleteSubject(req: Request, res: Response) {
    try {
        // Obtém o ID da disciplina a ser deletada
        const subjectId = req.params["subject_id"];

        // Se o parâmetro não for informado, lança erro 400
        if (!subjectId) {
            throw new AppError(400, "Missing param subject_id!");
        }

        // Chama o serviço responsável por remover a disciplina
        await DeleteSubject(subjectId);

        // Retorna sucesso informando que foi excluída
        return res.status(200).json({
            message: "Subject deleted successfully!",
            data: null
        });
    } catch (err: any) {
        // Tratamento de erro padronizado
        if (err instanceof AppError) {
            return res.status(err.code).json({ error: err.message });
        }

        console.error(err);
        return res.status(500).json({ error: 'Unexpected Error' });
    }
}
