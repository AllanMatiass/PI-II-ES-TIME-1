// Autores: Allan Matias e Cristian Fava

declare module 'dataModels' {

    // ===============================================
    // ENTIDADES EXISTENTES
    // ===============================================

    // Dados do professor no sistema
    interface ProfessorDataModel {
        id: string;
        name: string;
        email: string;
        phone: string;
        password: string;
        created_at: Date;
    }

    // Dados de uma instituição
    interface InstitutionDataModel {
        id: string;
        name: string;
    }

    // Relação entre professor e instituição
    interface ProfessorInstitutionDataModel {
        id: string;
        institution_id: string;
        professor_id: string;
    }

    // Dados de um curso
    interface CourseDataModel {
        id: string;
        institution_id: string;
        name: string;
    }

    // Dados de uma disciplina dentro de um curso
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

    // Dados de uma turma
    interface ClassDataModel {
        id: string;
        subject_id: string;
        name: string;
        classroom: string;
    }

    // Dados de um aluno
    interface StudentDataModel {
        id: string;
        name: string;
        registration_id: string;
    }

    // Relação entre aluno e turma
    interface ClassStudentsDataModel {
        id: string;
        class_id: string;
        student_id: string;
    }

    // ===============================================
    // NOVA MODELAGEM CORRETA DE NOTAS
    // ===============================================

    // COMPONENTES DE NOTA (ex: P1, P2, Trabalho)
    interface GradeComponentDataModel {
        id: string;
        subject_id: string;
        name: string;
        formula_acronym: string;
        description: string;
    }

    // VALORES DE NOTA POR COMPONENTE PARA CADA ALUNO
    interface GradeComponentValueDataModel {
        id: string;
        component_id: string;
        student_id: string;
        grade_value: number;
    }

    // NOTA FINAL DO ALUNO NA DISCIPLINA (calculada automaticamente)
    interface GradeDataModel {
        id: string;
        student_id: string;
        subject_id: string;
        final_grade: number;
        entry_date: Date;
    }

    // FÓRMULA DA DISCIPLINA PARA CALCULAR A NOTA FINAL
    interface SubjectFinalFormulaDataModel {
        id: string;
        subject_id: string;
        formula_text: string;
    }
}