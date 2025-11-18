// Autores : Allan Matias e Cristian Fava

declare module 'dtos' {
	// ===============================================
	// LOGIN & PROFESSOR
	// ===============================================

	// Dados enviados para fazer login
	interface ProfessorLoginRequestDTO {
		email: string;
		password: string;
	}

	// Dados enviados para registrar um professor
	interface ProfessorRegisterRequestDTO {
		name: string;
		phone: string;
		email: string;
		password: string;
		confirmPassword: string;
	}

	// Dados devolvidos quando um professor é consultado
	interface ProfessorResponseDTO {
		id: string;
		name: string;
		phone: string;
		email: string;
		created_at: Date;
	}

	// ===============================================
	// INSTITUIÇÃO / CURSO / DISCIPLINA / TURMA
	// ===============================================

	// Dados para registrar uma instituição
	interface InstitutionRegisterRequestDTO {
		name: string;
	}

	// Dados devolvidos sobre uma instituição
	interface InstitutionResponseDTO {
		id: string;
		name: string;
	}

	// Instituição + lista de professores associados
	interface InstitutionWithProfessorsResponseDTO {
		institution: InstitutionResponseDTO;
		professors: ProfessorResponseDTO[];
	}

	// Dados para registrar um curso
	interface CourseRegisterRequestDTO {
		name: string;
		institution_id: string;
	}

	// Dados para registrar uma disciplina
	interface SubjectRegisterRequestDTO {
		course_id: string;
		name: string;
		code: string;
		acronym: string;
		period: number;
		start_date: Date;
		end_date: Date;
	}

	// Dados para registrar uma turma
	interface ClassRegisterRequestDTO {
		subject_id: string;
		name: string;
		classroom: string;
	}

	// Dados retornados sobre uma turma
	interface ClassResponseDTO {
		id: string;
		subject_id: string;
		name: string;
		classroom: string;
	}

	// ===============================================
	// ALUNOS
	// ===============================================

	// Dados para registrar um aluno
	interface StudentRegisterDTO {
		name: string;
		registration_id: string;
	}

	// Dados devolvidos sobre um aluno
	interface StudentResponseDTO {
		id: string;
		name: string;
		registration_id: string;
	}

	// ===============================================
	// NOTAS
	// ===============================================

	// Atualização de notas (componentes)
	interface ScoreRequestDTO {
		student_id: string;
		component_id: string;
		grade_value: number;
	}

	// Retorno após salvar a nota
	interface ScoreResponseDto {
		student_id: string;
		component_id: string;
		grade_component_value: number;
	}

	// Criar componente da disciplina
	interface GradeComponentRequestDTO {
		subject_id: string;
		name: string;
		formula_acronym: string;
		description: string;
	}

	// Dados devolvidos do componente criado
	interface GradeComponentResponseDTO {
		id: string;
		subject_id: string;
		name: string;
		formula_acronym: string;
		description: string;
	}

	// Criar grade (nota final do aluno na disciplina)
	interface CreateGradeRequestDTO {
		student_id: string;
		subject_id: string;
	}

	// CSV / exportação
	interface CSVResponseDTO {
		registration_id: string;
		student_name: string;
		component_name: string;
		grade: number;
	}

	// Fórmula final da disciplina
	interface UpdateFormulaRequestDTO {
		subject_id: string;
		formula_text: string;
	}

	// Dados devolvidos com a fórmula salva
	interface FormulaResponseDTO {
		id: string;
		subject_id: string;
		formula_text: string;
	}

	// Dados completos da disciplina
	interface SubjectResponseDTO {
		id: string;
		course_id: string;
		name: string;
		code: string;
		acronym: string;
		period: number;
		start_date: Date;
		end_date: Date;
	}
}
