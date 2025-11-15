
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
        classroom: string;
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

    interface StudentDataModel {
        id: string;
        name: string;
        registration_id: string;
    }

    interface ClassStudentsDataModel {
        id: string;
        class_id: string;
        student_id: string;
    }
    
    interface GradeComponentDataModel {
        id: string;
        subject_id: string;
        name: string;
        formula_acronym: string;
        description: string;
        grade_id: string;
    }

    interface GradeDataModel {
        id: string;
        student_id: string;
        subject_id: string;
        automatic_final_grade: number;
        entry_date: Date;
        grade_value: number;
    }
}

