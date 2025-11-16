// Autores: Allan Giovanni Matias Paes e Emilly Morelatto

// Importa os tipos e DTOs necessários
import {
	ClassRegisterRequestDTO,
	ClassResponseDTO,
	CSVResponseDTO,
	StudentRegisterDTO,
} from 'dtos';
import { AppError } from '../errors/AppError';
import { DatabaseClient } from '../db/DBClient';
import { ClassDataModel, ClassStudentsDataModel, GradeComponentDataModel, GradeComponentValueDataModel, GradeDataModel, StudentDataModel, SubjectDataModel } from 'dataModels';

// Cria instância do cliente de banco de dados
const db = new DatabaseClient();

// Define tabelas que serão manipuladas
const subjectTable = db.table<SubjectDataModel>('subjects');
const classTable = db.table<ClassDataModel>('classes');
const studentsTable = db.table<StudentDataModel>('students');
const classStudentsTable = db.table<ClassStudentsDataModel>('class_students');
const gradesTable = db.table<GradeDataModel>('grades');
const componentsTable = db.table<GradeComponentDataModel>('grade_components');
const componentsValuesTable = db.table<GradeComponentValueDataModel>('grade_component_values')
/**
 * Cria uma nova turma
 */
export async function insertClass(
	data: ClassRegisterRequestDTO
): Promise<ClassResponseDTO> {
	const { subject_id, name, classroom } = data;

	// Verifica se a disciplina existe
	const subject = await subjectTable.findUnique({ id: subject_id });
	if (!subject) {
		throw new AppError(404, 'Subject not found.');
	}

	// Insere nova turma na tabela
	const classId = await classTable.insert({ subject_id, name, classroom });
	const class_ = await classTable.findUnique({ id: classId });

	// Caso algo dê errado ao inserir
	if (!class_) {
		throw new AppError(404, 'Class not found.');
	}

	// Retorna os dados da nova turma criada
	return { id: classId, subject_id, name, classroom };
}

/**
 * Retorna todas as turmas cadastradas
 */
export async function findAllClasses(): Promise<ClassResponseDTO[]> {
	const class_ = (await classTable.findMany()) || [];
	return class_;
}

/**
 * Busca uma turma pelo ID
 */
export async function findClassByID(id: string): Promise<ClassResponseDTO> {
	const class_ = await classTable.findUnique({ id });

	if (!class_) {
		throw new AppError(404, 'Class not found.');
	}

	return class_;
}

/**
 * Retorna todas as turmas relacionadas a uma disciplina
 */
export async function findClassBySubjectId(
	subId: string
): Promise<ClassResponseDTO[]> {
	const subject = await subjectTable.findUnique({ id: subId });

	if (!subject) {
		throw new AppError(404, 'Subject not found.');
	}

	const classes = (await classTable.findMany({ subject_id: subId })) || [];
	return classes;
}

/**
 * Atualiza informações de uma turma
 */
export async function updateClass(
	id: string,
	data: Partial<ClassRegisterRequestDTO>
): Promise<ClassResponseDTO> {
	const classExist = await classTable.findUnique({ id });

	if (!classExist) {
		throw new AppError(404, 'Class not found.');
	}

	// Cria um objeto com apenas os campos que foram modificados
	const updateData: Partial<ClassRegisterRequestDTO> = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			// @ts-ignore ignora o tipo do indexador dinâmico
			if (classExist[key] && data[key] !== classExist[key]) {
				// @ts-ignore
				updateData[key] = data[key];
			}
		}
	}

	// Se nada mudou, retorna a turma original
	if (Object.keys(updateData).length === 0) {
		return classExist;
	}

	// Atualiza os campos alterados no banco
	await classTable.update(data, { id });
	const updatedClass = await classTable.findUnique({ id });

	// Caso algo dê errado na atualização
	if (!updatedClass) {
		throw new AppError(500, 'Something wrong happened');
	}

	return updatedClass;
}

/**
 * Exclui uma turma pelo ID
 */
export async function deleteClass(id: string): Promise<boolean> {
	const classExist = await classTable.findUnique({ id });

	if (!classExist) {
		throw new AppError(404, 'Class not found.');
	}

	const res = await classTable.deleteMany({ id });
	return res;
}

/**
 * Importa alunos em lote para uma turma (a partir de uma lista de objetos)
 */
export async function ImportClass(data: StudentRegisterDTO[], id: string) {
	for (const row of data) {
		const student = mapCsvRowToStudent(row);
		if (!student) continue;

		// Verifica se a linha tem os campos mínimos necessários
		if (student?.name && student.registration_id) {
			const studentExists = await studentsTable.findUnique({
				registration_id: student.registration_id,
			});
			const classExist = await classTable.findUnique({id});
			if (!classExist) throw new AppError(404, 'Class not found.');
			
			const studentIsAlreadyInClass = await classStudentsTable.findUnique({})
			console.log('studentExists:', studentExists);

			// Se o aluno ainda não existir, ele é inserido
			if (!studentExists) {
				await studentsTable.insert(student);
			}

			const classExist = await classTable.findUnique({id});
			if (!classExist) throw new AppError(404, 'Class not found.');
			
			const studentIsAlreadyInClass = await classStudentsTable.findUnique({
				student_id: studentExists!.id, 
				class_id: classExist.id
			});

			if (studentIsAlreadyInClass) continue;
			
			await classStudentsTable.insert({
				student_id: studentExists!.id, 
				class_id: classExist.id
			});
		}
	}
}

function mapCsvRowToStudent(row: any): StudentRegisterDTO | null {
  const values = Object.values(row).map(
	v => (v !== undefined && v !== null ? 
		String(v).trim() : ''
	));

  if (values.length < 2) return null;

  const registration_id: string | undefined = values[0];
  const name: string | undefined  = values[1];

  if (!registration_id || !name) return null;

  return { registration_id, name };
}


/**
 * Gera os dados de notas de uma turma, formatados para exportação em CSV
 */
export async function GetClassGradesForExport(classId: string, subjectId: string): Promise<CSVResponseDTO[]> {
    // Busca a classe específica e verifica se pertence à disciplina
    const cls = await classTable.findUnique({ id: classId });
    if (!cls) throw new AppError(400, 'Classe não encontrada');

    if (cls.subject_id !== subjectId)
        throw new AppError(400, 'A classe não pertence a essa disciplina');

    // Busca todos os alunos vinculados à turma
    const classStudents = await classStudentsTable.findMany({
        class_id: classId,
    });

    if (!classStudents || classStudents.length === 0) return [];

    const formattedData: CSVResponseDTO[] = [];

    for (const cs of classStudents) {
        const student = await studentsTable.findUnique({ id: cs.student_id });
        if (!student) continue;

        // Nota final do aluno na disciplina
        const grade = await gradesTable.findUnique({
            student_id: student.id, subject_id: subjectId,
        });
        if (!grade) continue;

        // Componentes da disciplina para o aluno
        const componentValues = await componentsValuesTable.findMany({ student_id: student.id });

        for (const cv of componentValues) {
            const component = await componentsTable.findUnique({ id: cv.component_id });
            if (!component) continue;

            formattedData.push({
                registration_id: student.registration_id,
                student_name: student.name,
                component_name: component.name,
                grade: cv.grade_value,
            });
        }

        // Adiciona a nota final
        formattedData.push({
            registration_id: student.registration_id,
            student_name: student.name,
            component_name: 'Final',
            grade: grade.final_grade,
        });
    }

    return formattedData;
}

/**
 * Gera o conteúdo de um arquivo CSV (string) com base nos dados recebidos.
 * Não salva no servidor — apenas retorna o texto formatado.
 */
export function GenerateCSVBuffer(data: CSVResponseDTO[]) {
	// Cabeçalho do CSV
	let csv = 'Matrícula,Aluno,Componente,Nota\n';

	// Adiciona cada linha de aluno ao CSV
	data.forEach((row) => {
		csv += `${row.registration_id},${row.student_name},${row.component_name},${row.grade}\n`;
	});

	// Retorna a string completa (pode ser salva como .csv)
	return csv;
}
