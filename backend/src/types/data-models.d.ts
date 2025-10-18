
declare module 'dataModels' {
    interface ProfessorDataModel {
        id: string;
        name: string;
        email: string;
        phone: string;
        password: string;
        created_at: number;
    }

    interface InstitutionDataModel {
        id: string;
        name: string;
    }
}