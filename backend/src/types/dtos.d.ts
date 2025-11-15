declare module 'dtos' {
	// requests
	interface ProfessorLoginRequestDTO {
		email: string;
		password: string;
	}
	// requests
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
	interface ProfessorRegisterRequestDTO {
		name: string;
		phone: string;
		email: string;
		password: string;
		confirmPassword: string;
	}

    interface InstitutionRegisterRequestDTO {
        name: string;
    }

     interface CourseRegisterRequestDTO {
        name: string;
        institution_id: string;
    }
    interface ClassRegisterRequestDTO {
        subject_id: string;
        name: string;
        classroom: string;
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

	interface StudentRegisterDTO {
		name: string;
		registration_id: string;
	}

	// responses
	interface ProfessorResponseDTO {
		id: string;
		name: string;
		phone: string;
		email: string;
		created_at: Date;
	}


	interface ProfessorResponseDTO {
		id: string;
		name: string;
		phone: string;
		email: string;
		created_at: Date;
	}

	interface InstitutionResponseDTO {
		id: string;
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
	interface InstitutionWithProfessorsResponseDTO {
		institution: InstitutionResponseDTO;
		professors: ProfessorResponseDTO[];
	}

    interface ClassResponseDTO {
        id: string;
        subject_id: string;
        name: string;
        classroom: string;
    }

	interface StudentResponseDTO {
		id: string;
		name: string;
		registration_id: string;
	}

	interface CSVResponseDTO {
  		registration_id: string;
  		student_name: string;
  		component_name: string;
  		grade: number;
	}

	interface ScoreResponseDto {
        student_id: string;
        subject_id: string;
        grade_value: number;
        automatic_final_grade: number,
        entry_date: Date;
    }

	interface ScoreRequestDTO {
		scores: {
			student_id: string;
			component_id: string;
			grade_value: number;
		}[]
	}

   
}

