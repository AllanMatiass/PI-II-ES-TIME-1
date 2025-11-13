// Autor: Allan Giovanni Matias Paes

import { ClassRegisterRequestDTO, ClassResponseDTO, CSVResponseDTO, StudentRegisterDTO } from 'dtos';
import { AppError } from '../errors/AppError';
import { DatabaseClient } from '../db/DBClient';
import {
	ClassDataModel,
	StudentDataModel,
	SubjectDataModel,
} from 'dataModels';

const db = new DatabaseClient();
const subjectTable = db.table<SubjectDataModel>('subjects');
const classTable = db.table<ClassDataModel>('classes');
const studentsTable = db.table<StudentDataModel>('students');
const classStudentsTable = db.table("class_students");
const gradesTable = db.table("grades");
const componentsTable = db.table("grade_components");

export async function insertClass(
	data: ClassRegisterRequestDTO
): Promise<ClassResponseDTO> {
	const { subject_id, name, classroom } = data;

	const subject = await subjectTable.findUnique({ id: subject_id });

	if (!subject) {
		throw new AppError(404, 'Subject not found.');
	}

	const classId = await classTable.insert({ subject_id, name, classroom });
	const class_ = await classTable.findUnique({ id: classId });

	if (!class_) {
		throw new AppError(404, 'Class not found.');
	}

	return {
		id: classId,
		subject_id,
		name,
		classroom,
	};
}

export async function findAllClasses(): Promise<ClassResponseDTO[]> {
	const class_ = (await classTable.findMany()) || [];

	return class_;
}

export async function findClassByID(id: string): Promise<ClassResponseDTO> {
	const class_ = await classTable.findUnique({ id });

	if (!class_) {
		throw new AppError(404, 'Class not found.');
	}

	return class_;
}

export async function findClassBySubjectId(
	subId: string
): Promise<ClassResponseDTO[]> {
	const subject = await subjectTable.findUnique({ id: subId });

	if (!subject) {
		throw new AppError(404, 'Subject not found.');
	}

	const classes =
		(await classTable.findMany({
			subject_id: subId,
		})) || [];

	return classes;
}

export async function updateClass(
	id: string,
	data: Partial<ClassRegisterRequestDTO>
): Promise<ClassResponseDTO> {
	const classExist = await classTable.findUnique({ id });
	if (!classExist) {
		throw new AppError(404, 'Class not found.');
	}

	// Cria um objeto só com os campos que mudaram
	const updateData: Partial<ClassRegisterRequestDTO> = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			// @ts-ignore
			if (classExist[key] && data[key] !== classExist[key]) {
				// @ts-ignore
				updateData[key] = data[key];
			}
		}
	}

	// Se não houver alterações, retorna a própria classe
	if (Object.keys(updateData).length === 0) {
		return classExist;
	}

	// Atualiza apenas os campos que mudaram
	await classTable.update(data, { id });
	const updatedClass = await classTable.findUnique({ id });

	if (!updatedClass) {
		throw new AppError(500, 'Something wrong happened');
	}

	return updatedClass;
}

export async function deleteClass(id: string): Promise<boolean> {
	const classExist = await classTable.findUnique({ id });
	if (!classExist) {
		throw new AppError(404, 'Class not found.');
	}

	const res = await classTable.deleteMany({ id });
	return res;
}

export async function ImportClass(data: StudentRegisterDTO[]) {
	for (const row of data) {
		if (row.name && row.registration_id) {
			const studentExists = studentsTable.findUnique({
				registration_id: row.registration_id
			});

			if (!studentExists) {
				await studentsTable.insert(row);
			}
		}
	}
}

export async function GetClassGradesForExport(classId: string) {
    const classStudents = await classStudentsTable.findMany({
			class_id: classId,
	});
	
    if(!classStudents||classStudents.length===0)
    {
        throw new AppError(400, "Nenhum aluno encontrado nessa turma");
    }

    const formattedData: CSVResponseDTO[]  = [];

    for (const cs of classStudents) {

        const student = await studentsTable.findUnique({ id: cs.student_id });
        const grade = await gradesTable.findUnique({ id: cs.grade_id });

        if (!student || !grade) continue;

        const component = await componentsTable.findUnique({ id: grade.grade_component_id });

        // Se alguma nota estiver faltando, sendo nula, indefinidada ou vazia, a exportação é bloqueada
        if (grade.automatic_final_grade === null ||grade.automatic_final_grade === undefined ||grade.automatic_final_grade === "-") 
        {
            throw new AppError(400, "Erro, está faltando nota!"); 
        }

        // Monta um objeto contendo os dados do aluno, componente e nota já prontos para exportação, e adiciona no array formattedData
        formattedData.push({registration_id: student.registration_id,student_name: student.name,component_name: component?.name ?? "Componente",grade: grade.automatic_final_grade});
		
	}
	return formattedData;
}

// Converte para CSV sem salvar no servidor
export function GenerateCSVBuffer(data: CSVResponseDTO[]) {
    let csv = "Matrícula,Aluno,Componente,Nota\n"; 

    data.forEach(row => {
        csv += `${row.registration_id},${row.student_name},${row.component_name},${row.grade}\n`;
    });

    return csv;
}