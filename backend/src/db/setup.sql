-- Autor: Allan Giovanni Matias Paes
-- ===============================
-- SETUP: Criação de tabelas e índices
-- ===============================

DROP DATABASE IF EXISTS nota_dez_db;
DROP PROCEDURE IF EXISTS GetStudentGrades;
DROP PROCEDURE IF EXISTS  GetStudentsByClass;
DROP PROCEDURE IF EXISTS  GetClassesByCourse;
DROP PROCEDURE IF EXISTS  GetGradeComponentsByClass;
DROP PROCEDURE IF EXISTS GetStudentHistory;


CREATE DATABASE nota_dez_db;
USE nota_dez_db;


CREATE TABLE Institutions (
    InstitutionId VARCHAR(36) NOT NULL PRIMARY KEY,
    Name VARCHAR(255)
);

CREATE TABLE Professors (
    ProfessorId VARCHAR(36) NOT NULL PRIMARY KEY,
    Name VARCHAR(255),
    Email VARCHAR(255) UNIQUE, 
    PhoneNumber VARCHAR(255),
    Password VARCHAR(255),
    CreatedAt TIMESTAMP
);

CREATE TABLE ProfessorInstitutions (
    ProfessorInstitutionId VARCHAR(36) NOT NULL PRIMARY KEY,
    InstitutionId VARCHAR(36),
    ProfessorId VARCHAR(36)
);

-- Tabela para Cursos
CREATE TABLE Courses (
    CourseId VARCHAR(36) NOT NULL PRIMARY KEY,
    ProfessorInstitutionId VARCHAR(36),
    Name VARCHAR(255)
);

-- Tabela para Disciplinas/Matérias
CREATE TABLE Subjects (
    SubjectId VARCHAR(36) NOT NULL PRIMARY KEY,
    CourseId VARCHAR(36),
    Name VARCHAR(255),
    Code VARCHAR(255),
    Acronym VARCHAR(255),
    Period INTEGER,
    StartDate DATE,
    EndDate DATE
);

-- Tabela para Turmas (grupos de alunos para uma matéria)
CREATE TABLE Classes (
    ClassId VARCHAR(36) NOT NULL PRIMARY KEY,
    SubjectId VARCHAR(36),
    Name VARCHAR(255),
    ClassroomLocation VARCHAR(255),
    ClassTime TIME,
    ClassDate DATE
);

-- Tabela para Componentes de Nota (ex: Prova Parcial, Projeto Final)
CREATE TABLE GradeComponents (
    GradeComponentId VARCHAR(36) NOT NULL PRIMARY KEY,
    ClassId VARCHAR(36),
    Name VARCHAR(255),
    FormulaAcronym VARCHAR(255),
    Description VARCHAR(255)
);

-- Tabela para Notas
CREATE TABLE Grades (
    GradeId VARCHAR(36) NOT NULL PRIMARY KEY,
    GradeComponentId VARCHAR(36),
    AutomaticFinalGrade DECIMAL(10, 2),
    AdjustedFinalGrade DECIMAL(10, 2),
    WasAdjusted BOOLEAN,
    EntryDate DATE
);

-- Tabela para Alunos
CREATE TABLE Students (
    StudentId VARCHAR(36) NOT NULL PRIMARY KEY,
    Name VARCHAR(255),
    RegistrationID VARCHAR(255) UNIQUE
);

-- Tabela de Associação: Turma e Alunos
CREATE TABLE ClassStudents (
    ClassStudentId VARCHAR(36) NOT NULL PRIMARY KEY,
    ClassId VARCHAR(36),
    GradeId VARCHAR(36),
    StudentId VARCHAR(36)
);

-- Tabela para a Fórmula de Cálculo da Nota Final
CREATE TABLE FinalGradeCalculations (
    FinalGradeCalculationId VARCHAR(36) NOT NULL PRIMARY KEY,
    ClassId VARCHAR(36),
    Formula VARCHAR(255)
);

-- Tabela para Auditoria
CREATE TABLE Audits (
    AuditId VARCHAR(36) NOT NULL PRIMARY KEY,
    CreatedAt TIMESTAMP,
    ChangeDescription VARCHAR(255),
    ProfessorId VARCHAR(36)
);

-- Adicionando Constraints de Chave Estrangeira

ALTER TABLE ProfessorInstitutions ADD CONSTRAINT fk_profinst_institution FOREIGN KEY (InstitutionId) REFERENCES Institutions(InstitutionId);
ALTER TABLE ProfessorInstitutions ADD CONSTRAINT fk_profinst_professor FOREIGN KEY (ProfessorId) REFERENCES Professors(ProfessorId);

ALTER TABLE Courses ADD CONSTRAINT fk_courses_profinst FOREIGN KEY (ProfessorInstitutionId) REFERENCES ProfessorInstitutions(ProfessorInstitutionId);

ALTER TABLE Subjects ADD CONSTRAINT fk_subjects_course FOREIGN KEY (CourseId) REFERENCES Courses(CourseId);

ALTER TABLE Classes ADD CONSTRAINT fk_classes_subject FOREIGN KEY (SubjectId) REFERENCES Subjects(SubjectId);

ALTER TABLE GradeComponents ADD CONSTRAINT fk_gradecomp_class FOREIGN KEY (ClassId) REFERENCES Classes(ClassId);

ALTER TABLE Grades ADD CONSTRAINT fk_grades_gradecomp FOREIGN KEY (GradeComponentId) REFERENCES GradeComponents(GradeComponentId);

ALTER TABLE ClassStudents ADD CONSTRAINT fk_classstudents_class FOREIGN KEY (ClassId) REFERENCES Classes(ClassId);
ALTER TABLE ClassStudents ADD CONSTRAINT fk_classstudents_grade FOREIGN KEY (GradeId) REFERENCES Grades(GradeId);
ALTER TABLE ClassStudents ADD CONSTRAINT fk_classstudents_student FOREIGN KEY (StudentId) REFERENCES Students(StudentId);

ALTER TABLE FinalGradeCalculations ADD CONSTRAINT fk_finalgradecalc_class FOREIGN KEY (ClassId) REFERENCES Classes(ClassId);

ALTER TABLE Audits ADD CONSTRAINT fk_audits_professor FOREIGN KEY (ProfessorId) REFERENCES Professors(ProfessorId);


/*******************************************************/
/* CRIAÇÃO DE ÍNDICES                                  */
/*******************************************************/

-- Índices para Chaves Estrangeiras (FKs) para acelerar JOINs
CREATE INDEX idx_profinst_institutionid ON ProfessorInstitutions(InstitutionId);
CREATE INDEX idx_profinst_professorid ON ProfessorInstitutions(ProfessorId);
CREATE INDEX idx_courses_profinstid ON Courses(ProfessorInstitutionId);
CREATE INDEX idx_subjects_courseid ON Subjects(CourseId);
CREATE INDEX idx_classes_subjectid ON Classes(SubjectId);
CREATE INDEX idx_gradecomp_classid ON GradeComponents(ClassId);
CREATE INDEX idx_grades_gradecompid ON Grades(GradeComponentId);
CREATE INDEX idx_classstudents_classid ON ClassStudents(ClassId);
CREATE INDEX idx_classstudents_gradeid ON ClassStudents(GradeId);
CREATE INDEX idx_classstudents_studentid ON ClassStudents(StudentId);
CREATE INDEX idx_finalgradecalc_classid ON FinalGradeCalculations(ClassId);
CREATE INDEX idx_audits_professorid ON Audits(ProfessorId);

-- Índices para colunas frequentemente consultadas (WHERE) ou ordenadas (ORDER BY)
CREATE INDEX idx_professors_name ON Professors(Name);
CREATE INDEX idx_students_name ON Students(Name);
CREATE INDEX idx_subjects_code ON Subjects(Code);
CREATE INDEX idx_subjects_name ON Subjects(Name);
CREATE INDEX idx_audits_createdat ON Audits(CreatedAt);


-- Procedures úteis
DELIMITER $$

CREATE PROCEDURE GetStudentGrades(IN StudentName VARCHAR(255))
BEGIN
    SELECT
		s.RegistrationID,
        s.Name,
        gc.Name,
        gc.FormulaAcronym,
        g.AutomaticFinalGrade,
        g.AdjustedFinalGrade,
        g.WasAdjusted
    FROM
        Students s
    JOIN
        ClassStudents cs ON s.StudentId = cs.StudentId
    JOIN
        Grades g ON cs.GradeId = g.GradeId
    JOIN
        GradeComponents gc ON g.GradeComponentId = gc.GradeComponentId
    WHERE
        s.Name = StudentName;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetStudentsByClass(IN ClassName VARCHAR(255))
BEGIN
    SELECT DISTINCT
        s.RegistrationID,
        s.Name as StudentName,
        c.Name as Class,
        sub.Name
    FROM Students s
    JOIN ClassStudents cs ON s.StudentId = cs.StudentId
    JOIN Classes c ON cs.ClassId = c.ClassId
    JOIN Subjects sub ON c.SubjectId = sub.SubjectId
    WHERE c.Name = ClassName;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetClassesByCourse(IN CourseName VARCHAR(255))
BEGIN
    SELECT
        c.Name AS Turma,
        sub.Name AS Disciplina,
        s.Name AS Professor
    FROM Classes c
    JOIN Subjects sub ON c.SubjectId = sub.SubjectId
    JOIN Courses co ON sub.CourseId = co.CourseId
    JOIN ProfessorInstitutions pi ON co.ProfessorInstitutionId = pi.ProfessorInstitutionId
    JOIN Professors s ON pi.ProfessorId = s.ProfessorId
    WHERE co.Name = CourseName;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetGradeComponentsByClass(IN ClassName VARCHAR(255))
BEGIN
    SELECT
        gc.Name AS Componente,
        gc.FormulaAcronym AS Sigla,
        gc.Description AS Descricao,
        c.Name AS Turma,
        sub.Name AS Disciplina
    FROM GradeComponents gc
    JOIN Classes c ON gc.ClassId = c.ClassId
    JOIN Subjects sub ON c.SubjectId = sub.SubjectId
    WHERE c.Name = ClassName;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetStudentHistory(IN StudentName VARCHAR(255))
BEGIN
    SELECT
        s.RegistrationID,
        s.Name AS NomeDoAluno,
        sub.Name AS Disciplina,
        c.Name AS Turma,
        gc.Name AS Componente,
        g.AutomaticFinalGrade AS Nota,
        g.AdjustedFinalGrade AS NotaAjustada,
        g.WasAdjusted AS FoiAjustada,
        g.EntryDate AS DataRegistro
    FROM Students s
    JOIN ClassStudents cs ON s.StudentId = cs.StudentId
    JOIN Grades g ON cs.GradeId = g.GradeId
    JOIN GradeComponents gc ON g.GradeComponentId = gc.GradeComponentId
    JOIN Classes c ON cs.ClassId = c.ClassId
    JOIN Subjects sub ON c.SubjectId = sub.SubjectId
    WHERE s.Name = StudentName
    ORDER BY g.EntryDate DESC;
END$$

DELIMITER ;