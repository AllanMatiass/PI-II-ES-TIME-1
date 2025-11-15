    DROP DATABASE IF EXISTS nota_dez_db;
    CREATE DATABASE nota_dez_db;
    USE nota_dez_db;

    -- ===============================
    -- Tabelas principais
    -- ===============================
    CREATE TABLE institutions (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255)
    );

    CREATE TABLE professors (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE, 
        phone VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMP
    );

    CREATE TABLE professor_institutions (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        institution_id VARCHAR(36),
        professor_id VARCHAR(36),
        CONSTRAINT fk_profinst_institution FOREIGN KEY (institution_id) 
            REFERENCES institutions(id) ON DELETE CASCADE,
        CONSTRAINT fk_profinst_professor FOREIGN KEY (professor_id) 
            REFERENCES professors(id) ON DELETE RESTRICT
    );

    CREATE TABLE courses (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255),
        institution_id VARCHAR(36),
        CONSTRAINT fk_courses_institution FOREIGN KEY (institution_id) 
            REFERENCES institutions(id) ON DELETE CASCADE
    );

    -- Subjects
    CREATE TABLE subjects (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        course_id VARCHAR(36),
        name VARCHAR(255),
        code VARCHAR(255),
        acronym VARCHAR(255),
        period INTEGER,
        start_date DATE,
        end_date DATE,
        CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) 
            REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Classes
    CREATE TABLE classes (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        subject_id VARCHAR(36),
        name VARCHAR(255),
        classroom VARCHAR(255),
        CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) 
            REFERENCES subjects(id) ON DELETE CASCADE
    );

    -- Students
    CREATE TABLE students (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255),
        registration_id VARCHAR(255) UNIQUE
    );

    -- Grade Components
    CREATE TABLE grade_components (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        subject_id VARCHAR(36),
        name VARCHAR(255),
        formula_acronym VARCHAR(255),
        description VARCHAR(255),
        grade_id VARCHAR(36),
        CONSTRAINT fk_gradecomp_subject FOREIGN KEY (subject_id) 
            REFERENCES subjects(id) ON DELETE CASCADE,
        CONSTRAINT fk_gradecomp_grade FOREIGN KEY (grade_id)
            REFERENCES grades(id) ON DELETE CASCADE
    );

    -- Grades
    CREATE TABLE grades (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        student_id VARCHAR(36),
        subject_id VARCHAR(36),
        automatic_final_grade DECIMAL(10, 2),
        entry_date DATE,
        grade_value DECIMAL(10,2),
        formula VARCHAR(255),
        CONSTRAINT fk_grade_student FOREIGN KEY (student_id) 
            REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT fk_grade_subject FOREIGN KEY (subject_id) 
            REFERENCES subjects(id) ON DELETE CASCADE
    );

    -- Class Students
    CREATE TABLE class_students (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        class_id VARCHAR(36),
        student_id VARCHAR(36),
        CONSTRAINT fk_classstudents_class FOREIGN KEY (class_id)
            REFERENCES classes(id) ON DELETE CASCADE,
        CONSTRAINT fk_classstudents_student FOREIGN KEY (student_id) 
            REFERENCES students(id) ON DELETE RESTRICT
    );

    -- Auditoria
    CREATE TABLE audits (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        created_at TIMESTAMP,
        change_description VARCHAR(255),
        professor_id VARCHAR(36),
        CONSTRAINT fk_audits_professor FOREIGN KEY (professor_id) 
            REFERENCES professors(id) ON DELETE SET NULL
    );

    -- ===============================
    -- PROCEDURES CORRIGIDAS
    -- ===============================
    DELIMITER $$

    CREATE PROCEDURE create_audit(
        IN p_professor_id VARCHAR(36),
        IN p_change_description VARCHAR(255)
    )
    BEGIN
        INSERT INTO audits (
            id,
            created_at,
            change_description,
            professor_id
        )
        VALUES (
            UUID(),              -- gera ID único
            NOW(),               -- timestamp automático
            p_change_description,
            p_professor_id
        );
    END$$

    DELIMITER ;
