
declare module 'dtos' {
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

    interface InstitutionRegisterRequestDTO {
        name: string;
    }

    // responses
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

    interface InstitutionWithProfessorsResponseDTO {
        institution: InstitutionResponseDTO;
        professors: ProfessorResponseDTO[];
    }

    interface CourseRegisterRequestDTO {
        name: string;
        institution_id: string;
    }
}