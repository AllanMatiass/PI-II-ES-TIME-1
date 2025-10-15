-- Autor: Allan Giovanni Matias Paes
-- ===============================
-- SETUP: Criação de tabelas e índices
-- ===============================

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
    professor_id VARCHAR(36)
);

-- Tabela para Cursos
CREATE TABLE courses (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    professor_institution_id VARCHAR(36),
    name VARCHAR(255)
);

-- Tabela para Disciplinas/Matérias
CREATE TABLE subjects (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    course_id VARCHAR(36),
    name VARCHAR(255),
    code VARCHAR(255),
    acronym VARCHAR(255),
    period INTEGER,
    start_date DATE,
    end_date DATE
);

-- Tabela para Turmas (grupos de alunos para uma matéria)
CREATE TABLE classes (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    subject_id VARCHAR(36),
    name VARCHAR(255),
    classroom_location VARCHAR(255),
    class_time TIME,
    class_date DATE
);

-- Tabela para Componentes de Nota (ex: Prova Parcial, Projeto Final)
CREATE TABLE grade_components (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    class_id VARCHAR(36),
    name VARCHAR(255),
    formula_acronym VARCHAR(255),
    description VARCHAR(255)
);

-- Tabela para Notas
CREATE TABLE grades (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    grade_component_id VARCHAR(36),
    automatic_final_grade DECIMAL(10, 2),
    adjusted_final_grade DECIMAL(10, 2),
    was_adjusted BOOLEAN,
    entry_date DATE
);

-- Tabela para Alunos
CREATE TABLE students (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255),
    registration_id VARCHAR(255) UNIQUE
);

-- Tabela de Associação: Turma e Alunos
CREATE TABLE class_students (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    class_id VARCHAR(36),
    grade_id VARCHAR(36),
    student_id VARCHAR(36)
);

-- Tabela para a Fórmula de Cálculo da Nota Final
CREATE TABLE final_grade_calculations (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    class_id VARCHAR(36),
    formula VARCHAR(255)
);

-- Tabela para Auditoria
CREATE TABLE audits (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    created_at TIMESTAMP,
    change_description VARCHAR(255),
    professor_id VARCHAR(36)
);

-- ===============================
-- Constraints de Chave Estrangeira
-- ===============================

ALTER TABLE professor_institutions ADD CONSTRAINT fk_profinst_institution FOREIGN KEY (institution_id) REFERENCES institutions(id);
ALTER TABLE professor_institutions ADD CONSTRAINT fk_profinst_professor FOREIGN KEY (professor_id) REFERENCES professors(id);

ALTER TABLE courses ADD CONSTRAINT fk_courses_profinst FOREIGN KEY (professor_institution_id) REFERENCES professor_institutions(id);

ALTER TABLE subjects ADD CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) REFERENCES courses(id);

ALTER TABLE classes ADD CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);

ALTER TABLE grade_components ADD CONSTRAINT fk_gradecomp_class FOREIGN KEY (class_id) REFERENCES classes(id);

ALTER TABLE grades ADD CONSTRAINT fk_grades_gradecomp FOREIGN KEY (grade_component_id) REFERENCES grade_components(id);

ALTER TABLE class_students ADD CONSTRAINT fk_classstudents_class FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE class_students ADD CONSTRAINT fk_classstudents_grade FOREIGN KEY (grade_id) REFERENCES grades(id);
ALTER TABLE class_students ADD CONSTRAINT fk_classstudents_student FOREIGN KEY (student_id) REFERENCES students(id);

ALTER TABLE final_grade_calculations ADD CONSTRAINT fk_finalgradecalc_class FOREIGN KEY (class_id) REFERENCES classes(id);

ALTER TABLE audits ADD CONSTRAINT fk_audits_professor FOREIGN KEY (professor_id) REFERENCES professors(id);

-- ===============================
-- Criação de índices
-- ===============================

-- Índices para Chaves Estrangeiras (FKs) para acelerar JOINs
CREATE INDEX idx_profinst_institution_id ON professor_institutions(institution_id);
CREATE INDEX idx_profinst_professor_id ON professor_institutions(professor_id);
CREATE INDEX idx_courses_profinst_id ON courses(professor_institution_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);
CREATE INDEX idx_classes_subject_id ON classes(subject_id);
CREATE INDEX idx_gradecomp_class_id ON grade_components(class_id);
CREATE INDEX idx_grades_gradecomp_id ON grades(grade_component_id);
CREATE INDEX idx_classstudents_class_id ON class_students(class_id);
CREATE INDEX idx_classstudents_grade_id ON class_students(grade_id);
CREATE INDEX idx_classstudents_student_id ON class_students(student_id);
CREATE INDEX idx_finalgradecalc_class_id ON final_grade_calculations(class_id);
CREATE INDEX idx_audits_professor_id ON audits(professor_id);

-- Índices para colunas frequentemente consultadas (WHERE) ou ordenadas (ORDER BY)
CREATE INDEX idx_professors_name ON professors(name);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_audits_created_at ON audits(created_at);

-- ===============================
-- Procedures úteis
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

DELIMITER ;

DELIMITER $$

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

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_grade_components_by_class(IN class_name VARCHAR(255))
BEGIN
    SELECT
        gc.name AS component_name,
        gc.formula_acronym AS acronym,
        gc.description AS description,
        c.name AS class_name,
        sub.name AS subject_name
    FROM grade_components gc
    JOIN classes c ON gc.class_id = c.id
    JOIN subjects sub ON c.subject_id = sub.id
    WHERE c.name = class_name;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_student_history(IN student_name VARCHAR(255))
BEGIN
    SELECT
        s.registration_id,
        s.name AS student_name,
        sub.name AS subject_name,
        c.name AS class_name,
        gc.name AS component_name,
        g.automatic_final_grade AS grade,
        g.adjusted_final_grade AS adjusted_grade,
        g.was_adjusted AS was_adjusted,
        g.entry_date AS entry_date
    FROM students s
    JOIN class_students cs ON s.id = cs.student_id
    JOIN grades g ON cs.grade_id = g.id
    JOIN grade_components gc ON g.grade_component_id = gc.id
    JOIN classes c ON cs.class_id = c.id
    JOIN subjects sub ON c.subject_id = sub.id
    WHERE s.name = student_name
    ORDER BY g.entry_date DESC;
END$$

DELIMITER ;
