-- Autor: Allan Giovanni Matias Paes
-- ===============================
-- SETUP: Criação de tabelas e índices
-- ===============================

CREATE DATABASE IF NOT EXISTS nota_dez_db;
USE nota_dez_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS professor (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Índice para busca rápida por email
CREATE INDEX idx_professor_email ON professor(email);


-- Tabela de instituições
CREATE TABLE IF NOT EXISTS institution (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Index para otimiza rbusca de instituição por nome
CREATE INDEX idx_institution_name ON institution(name);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS course (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    institutionId VARCHAR(36),
    FOREIGN KEY (institutionId) REFERENCES institution(id)
);

-- Tabela de matérias
CREATE TABLE IF NOT EXISTS subject (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(20),
    period VARCHAR(50),
    formula VARCHAR(255),
    courseId VARCHAR(36),
    FOREIGN KEY (courseId) REFERENCES course(id)
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS classgroup (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    code VARCHAR(50),
    subjectId VARCHAR(36),
    FOREIGN KEY (subjectId) REFERENCES subject(id)
);

-- Tabela de estudantes
CREATE TABLE IF NOT EXISTS student (
    id VARCHAR(36) PRIMARY KEY,
    registration VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
);

-- Índice para busca rápida por registration
CREATE INDEX idx_student_registration ON student(registration);

-- Tabela de associação entre student e classgroup

CREATE TABLE IF NOT EXISTS student_classgroup (
    studentId VARCHAR(36),
    classGroupId VARCHAR(36),
    PRIMARY KEY (studentId, classGroupId),
    FOREIGN KEY (studentId) REFERENCES student(id),
    FOREIGN KEY (classGroupId) REFERENCES classgroup(id)
);

-- Tabela de resumo de notas dos estudantes
CREATE TABLE IF NOT EXISTS  student_grade_summary (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36),
    subjectId VARCHAR(36),
    finalGrade DECIMAL(4, 2),
    adjustedGrade DECIMAL(4, 2),
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES student(id),
    FOREIGN KEY (subjectId) REFERENCES subject(id)
);

-- Índices para consultas frequentes
CREATE INDEX idx_summary_student ON student_grade_summary(studentId);
CREATE INDEX idx_summary_subject ON student_grade_summary(subjectId);

-- Tabela de componentes de nota
CREATE TABLE IF NOT EXISTS grade_component (
    id VARCHAR(36) PRIMARY KEY,
    subjectId VARCHAR(36),
    name VARCHAR(255),
    acronym VARCHAR(20),
    description TEXT,
    weight DECIMAL(4, 2),
    FOREIGN KEY (subjectId) REFERENCES subject(id)
);

-- Índice para buscar componentes por matéria
CREATE INDEX idx_component_subject ON grade_component(subjectId);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS grade (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36),
    componentId VARCHAR(36),
    value DECIMAL(4, 2),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES student(id),
    FOREIGN KEY (componentId) REFERENCES grade_component(id)
);

-- Índices para consultas frequentes
CREATE INDEX idx_grade_student ON grade(studentId);
CREATE INDEX idx_grade_component ON grade(componentId);

-- Tabela de audit logs
CREATE TABLE IF NOT EXISTS audit_log (
    id VARCHAR(36) PRIMARY KEY,
    gradeId VARCHAR(36),
    oldValue DECIMAL(4, 2),
    newValue DECIMAL(4, 2),
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gradeId) REFERENCES grade(id)
);

-- Índice para buscar logs por nota
CREATE INDEX idx_auditlog_grade ON audit_log(gradeId);
