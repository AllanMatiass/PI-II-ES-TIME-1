declare module 'dtos' {
	// ===============================================
	// LOGIN & PROFESSOR
	// ===============================================

	interface ProfessorLoginRequestDTO {
		email: string;
		password: string;
	}

	interface ProfessorRegisterRequestDTO {
		name: string;
		phone: string;
		email: string;
		password: string;
		confirmPassword: string;
	}

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

	interface InstitutionRegisterRequestDTO {
		name: string;
	}

	interface InstitutionResponseDTO {
		id: string;
		name: string;
	}

	interface InstitutionWithProfessorsResponseDTO {
		institution: InstitutionResponseDTO;
		professors: ProfessorResponseDTO[];
	}

	interface CourseRegisterRequestDTO {
		name: string;
		institution_id: string;
	}

	interface SubjectRegisterRequestDTO {
		course_id: string;
		name: string;
		code: string;
		acronym: string;
		period: number;
		start_date: Date;
		end_date: Date;
	}

	interface ClassRegisterRequestDTO {
		subject_id: string;
		name: string;
		classroom: string;
	}

	interface ClassResponseDTO {
		id: string;
		subject_id: string;
		name: string;
		classroom: string;
	}

	// ===============================================
	// ALUNOS
	// ===============================================

	interface StudentRegisterDTO {
		name: string;
		registration_id: string;
	}

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

	interface FormulaResponseDTO {
		id: string;
		subject_id: string;
		formula_text: string;
	}
}
