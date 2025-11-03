
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

    interface CourseDataModel {
        id: string;
        institution_id: string;
        name: string;
    }

    interface ClassDataModel {
        id: string;
        subject_id: string;
        name: string;
        classroom_location: string;
        class_time: string;
        class_date: Date;
    }

    interface SubjectDataModel {
        id: string;
        course_id: string;
        name: string;
        code: string;
        acronym: string;
        period: number;
        start_date: Date;
        end_date: Date;
    }

    interface ClassDataModel {
        id: string;
        subject_id: string;
        name: string;
        classroom_location: string;
        class_time: string;
        class_date: Date;
    }

    interface SubjectDataModel {
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

