
declare module 'dataModels' {
    interface ProfessorDataModel {
        id: string;
        name: string;
        email: string;
        phone: string;
        password: string;
        created_at: Date;
    }

    interface InstitutionDataModel {
        id: string;
        name: string;
    }

    interface ProfessorInstitutionDataModel {
        id: string,
        institution_id: string,
        professor_id: string
    }
}

