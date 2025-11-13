// Autor: Cristian Eduardo Fava
import { DatabaseClient } from '../db/DBClient';
import { CourseDataModel, InstitutionDataModel } from 'dataModels';
import { AppError } from '../errors/AppError';
import { CourseRegisterRequestDTO } from 'dtos';

// cria uma instância do cliente do banco
const db: DatabaseClient = new DatabaseClient();

// pega as tabelas de instituições e cursos
const institutionTable = db.table<InstitutionDataModel>('institutions');
const courseTable = db.table<CourseDataModel>('courses');

export async function insertCourse(
	dto: CourseRegisterRequestDTO
): Promise<CourseDataModel | null> {

	// verifica se a instituição existe
	const institutionExists = await institutionTable.findUnique({
		id: dto.institution_id,
	});

	// se não existir, retorna erro
	if (!institutionExists) {
		throw new AppError(404, 'Institution does not exist.');
	}

	// insere o curso e pega o id retornado
	const courseId = await courseTable.insert(dto);

	// busca o curso recém-criado
	const course = await courseTable.findUnique({
		id: courseId,
	});

	// retorna o curso criado
	return course;
}

export async function GetInstitutionCourses(
	institutionId: string
): Promise<CourseDataModel[]> {

	// busca todos os cursos da instituição
	const courses = await courseTable.findMany({
		institution_id: institutionId,
	});

	// retorna a lista
	return courses;
}

export async function UpdateCourse(name: string, id: string): Promise<boolean> {

	// verifica se o curso existe
	const courseExists = await courseTable.findUnique({
		id,
	});

	// se não existir, lança erro
	if (!courseExists) {
		throw new AppError(404, 'Course does not exist.');
	}

	// atualiza o curso mantendo institution_id
	await courseTable.update(
		{
			name,
			institution_id: courseExists.institution_id,
		},
		{
			id: courseExists.id,
		}
	);

	// retorna sucesso
	return true;
}

export async function DeleteCouse(courseId: string): Promise<boolean> {

	// verifica se o curso existe
	const courseExists = await courseTable.findUnique({
		id: courseId,
	});

	// se não existir, lança erro
	if (!courseExists) {
		throw new AppError(404, 'Course does not exist.');
	}

	// deleta o curso
	await courseTable.deleteMany({
		id: courseId,
	});

	// retorna sucesso
	return true;
}
