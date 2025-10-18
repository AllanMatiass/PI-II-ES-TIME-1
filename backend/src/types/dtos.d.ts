
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
    }

      interface InstitutionResponseDTO {
        id: string;
        name: string;
    }
}