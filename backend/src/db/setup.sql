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
    classroom_location VARCHAR(255),
    class_time TIME,
    class_date DATE,
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
    CONSTRAINT fk_gradecomp_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- Grades
CREATE TABLE grades (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    student_id VARCHAR(36),
    grade_component_id VARCHAR(36),
    class_id VARCHAR(36),
    automatic_final_grade DECIMAL(10, 2),
    entry_date DATE,
    grade_value DECIMAL(10,2),
    CONSTRAINT fk_grade_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_grade_component FOREIGN KEY (grade_component_id) REFERENCES grade_components(id) ON DELETE CASCADE,
    CONSTRAINT fk_grade_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
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

CREATE PROCEDURE get_students_by_class(IN class_name VARCHAR(255))
BEGIN
    SELECT DISTINCT
        s.registration_id,
        s.name as student_name,
        c.name as class_name,
        sub.name as subject_name
    FROM students s
    JOIN class_students cs ON s.id = cs.student_id
    JOIN classes c ON cs.class_id = c.id
    JOIN subjects sub ON c.subject_id = sub.id
    WHERE c.name = class_name;
END$$

CREATE PROCEDURE get_classes_by_course(IN course_name VARCHAR(255))
BEGIN
    SELECT
        c.name AS class_name,
        sub.name AS subject_name,
        p.name AS professor_name
    FROM classes c
    JOIN subjects sub ON c.subject_id = sub.id
    JOIN courses co ON sub.course_id = co.id
    JOIN professor_institutions pi ON co.professor_institution_id = pi.id
    JOIN professors p ON pi.professor_id = p.id
    WHERE co.name = course_name;
END$$

CREATE PROCEDURE get_grade_components_by_class(IN class_name VARCHAR(255))
BEGIN
    SELECT
        gc.name AS component_name,
        gc.formula_acronym AS acronym,
        gc.description AS description,
        c.name AS class_name,
        sub.name AS subject_name
    FROM grade_components gc
    JOIN subjects sub ON gc.subject_id = sub.id
    JOIN classes c ON c.subject_id = sub.id
    WHERE c.name = class_name;
END$$

CREATE PROCEDURE get_student_history(IN student_name VARCHAR(255))
BEGIN
    SELECT
        s.registration_id,
        s.name AS student_name,
        sub.name AS subject_name,
        c.name AS class_name,
        gc.name AS component_name,
        g.automatic_final_grade AS grade,
        g.entry_date AS entry_date
    FROM students s
    JOIN grades g ON s.id = g.student_id
    JOIN grade_components gc ON g.grade_component_id = gc.id
    JOIN classes c ON g.class_id = c.id
    JOIN subjects sub ON c.subject_id = sub.id
    WHERE s.name = student_name
    ORDER BY g.entry_date DESC;
END$$

DELIMITER ;
