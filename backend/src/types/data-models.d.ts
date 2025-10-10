
declare module 'dataModels' {
    interface ProfessorDataModel {
        id: string;
        name: string;
        email: string;
        phone: string;
        password: string;
    }

    interface InstitutionDataModel {
        id: string;
        name: string;
    }
}