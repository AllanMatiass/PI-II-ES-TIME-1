import {
	ClassStudentsDataModel,
	GradeDataModel,
	GradeComponentDataModel,
	StudentDataModel,
	SubjectDataModel,
	GradeComponentValueDataModel,
	SubjectFinalFormulaDataModel,
} from 'dataModels';

import { DatabaseClient } from '../db/DBClient';
import { AppError } from '../errors/AppError';

import {
	ScoreRequestDTO,
	GradeComponentRequestDTO,
	CreateGradeRequestDTO,
} from 'dtos';

const db = new DatabaseClient();

const gradesTable = db.table<GradeDataModel>('grades');
const componentsTable = db.table<GradeComponentDataModel>('grade_components');
const componentValuesTable = db.table<GradeComponentValueDataModel>(
	'grade_component_values'
);
const formulaTable = db.table<SubjectFinalFormulaDataModel>(
	'subject_final_formula'
);

const studentsTable = db.table<StudentDataModel>('students');
const classStudentsTable = db.table<ClassStudentsDataModel>('class_students');
const subjectTable = db.table<SubjectDataModel>('subjects');

// 1. ATUALIZAR NOTAS

export async function updateScoreService(
	subjectId: string,
	score: ScoreRequestDTO
) {
	const { student_id, component_id, grade_value } = score;

	const student = await studentsTable.findUnique({ id: student_id });
	if (!student) {
		throw new AppError(404, 'Student not found.');
	}

	const comp = await componentsTable.findUnique({ id: component_id });

	if (!comp) {
		throw new AppError(404, 'Component not found.');
	}

	if (comp.subject_id !== subjectId) {
		throw new AppError(400, 'Componente não pertence à disciplina.');
	}

	// Normaliza nota
	const parsed = Math.min(Math.max(Number(grade_value) || 0, 0), 10);

	// Descobrir ou criar o registro do componente para o aluno
	const existing = await componentValuesTable.findUnique({
		student_id,
		component_id,
	});

	if (existing) {
		await componentValuesTable.update(
			{ grade_value: parsed },
			{ id: existing.id }
		);
	} else {
		await componentValuesTable.insert({
			component_id,
			student_id,
			grade_value: parsed,
		});
	}

	await db.query('CALL recalc_student_final_grade(?, ?)', [
		student_id,
		subjectId,
	]);

	let grade = await gradesTable.findUnique({
		student_id,
		subject_id: subjectId,
	});

	if (!grade) {
		await gradesTable.insert({
			student_id,
			subject_id: subjectId,
			final_grade: 0,
			entry_date: new Date(),
		});

		await db.query('CALL recalc_student_final_grade(?, ?)', [
			student_id,
			subjectId,
		]);

		grade = await gradesTable.findUnique({
			student_id,
			subject_id: subjectId,
		});
	}

	// O SQL recalcula automaticamente via triggers
	return grade;
}

// 2. LISTAR NOTAS DE UMA TURMA

export async function listScoreService(classId: string, subjectId: string) {
	const classStudents = await classStudentsTable.findMany({
		class_id: classId,
	});
	const components = await componentsTable.findMany({ subject_id: subjectId });

	const result = [];

	for (const cs of classStudents) {
		const student = await studentsTable.findUnique({ id: cs.student_id });
		if (!student) continue;

		const studentValues = await componentValuesTable.findMany({
			student_id: student.id,
		});

		const detailed = components.map((comp) => {
			const val = studentValues.find((v) => v.component_id === comp.id);

			return {
				component_id: comp.id,
				component_name: comp.name,
				formula_acronym: comp.formula_acronym,
				grade_value: Number(val?.grade_value ?? 0),
			};
		});

		const grade = await gradesTable.findUnique({
			student_id: student.id,
			subject_id: subjectId,
		});

		result.push({
			student_id: student.id,
			student_name: student.name,
			registration_id: student.registration_id,
			components: detailed,
			final_grade: Number(grade?.final_grade ?? 0),
		});
	}

	return result;
}

// 3. ADICIONAR COMPONENTE

export async function addComponentService(data: GradeComponentRequestDTO) {
	const { subject_id, name, formula_acronym, description } = data;

	const subject = await subjectTable.findUnique({ id: subject_id });
	if (!subject) throw new AppError(404, 'Subject not found.');

	const exists = await componentsTable.findUnique({
		formula_acronym,
		subject_id,
	});

	if (exists) throw new AppError(409, 'Acrônimo já existe nesta disciplina.');

	const id = await componentsTable.insert({
		name,
		subject_id,
		formula_acronym,
		description,
	});

	return {
		message: 'Componente criado.',
		component_id: id,
	};
}

// 4. CRIAR GRADE PARA ALUNO (1 por aluno/subject)

export async function addGradeService(data: CreateGradeRequestDTO) {
	const { student_id, subject_id } = data;

	const student = await studentsTable.findUnique({ id: student_id });
	if (!student) throw new AppError(404, 'Student not found.');

	const subject = await subjectTable.findUnique({ id: subject_id });
	if (!subject) throw new AppError(404, 'Subject not found.');

	const exists = await gradesTable.findUnique({ student_id, subject_id });
	if (exists)
		throw new AppError(409, 'Grade já existe para este aluno na disciplina.');

	const id = await gradesTable.insert({
		student_id,
		subject_id,
		final_grade: 0,
		entry_date: new Date(),
	});

	return {
		message: 'Grade criada.',
		grade_id: id,
	};
}

// 5. DEFINIR / ATUALIZAR FÓRMULA FINAL DA DISCIPLINA

export async function updateFinalFormulaService(
	subjectId: string,
	formula: string
) {
	try {
		const subject = await subjectTable.findUnique({ id: subjectId });
		if (!subject) {
			throw new AppError(404, 'Subject not found.');
		}

		const existing = await formulaTable.findUnique({
			subject_id: subjectId,
		});

		if (existing) {
			await formulaTable.update(
				{
					formula_text: formula,
				},
				{
					id: existing.id,
				}
			);

			const grades = await gradesTable.findMany({
				subject_id: subjectId,
			});

			for (const grade of grades) {
				await db.query('CALL recalc_student_final_grade(?, ?)', [
					grade.student_id,
					subjectId,
				]);
			}

			return {
				message: 'Fórmula atualizada.',
			};
		}

		await formulaTable.insert({
			subject_id: subjectId,
			formula_text: formula,
		});

		return {
			message: 'Fórmula criada.',
		};
	} catch (err: any) {
		if (err?.code === 'ER_SIGNAL_EXCEPTION' || err?.errno === 1644) {
			const clean = err.sqlMessage.replace('Erro: ', '');
			throw new AppError(400, clean);
		}

		console.error('Database error:', err);
		throw new AppError(500, 'Erro ao salvar fórmula.');
	}
}

// 6. GET fórmula final
export async function getFinalFormulaService(subjectId: string) {
	const subject = await subjectTable.findUnique({ id: subjectId });
	if (!subject) throw new AppError(404, 'Subject not found.');

	const formula = await formulaTable.findUnique({ subject_id: subjectId });

	if (!formula) {
		return { formula_text: null };
	}

	return {
		formula_text: formula.formula_text,
	};
}

// 7. GET GRADE BY ID

export async function getGradeById(id: string) {
	const grade = await gradesTable.findUnique({ id });
	if (!grade) throw new AppError(404, 'Grade not found.');
	return grade;
}

export async function getComponentsBySubjectService(subjectId: string) {
	return await componentsTable.findMany({
		subject_id: subjectId,
	});
}

export async function updateComponentService(
	componentId: string,
	data: Partial<GradeComponentRequestDTO>
) {
	await componentsTable.update(data, {
		id: componentId,
	});
}

export async function deleteComponentService(componentId: string) {
	await componentsTable.deleteMany({
		id: componentId,
	});
}
