DROP DATABASE IF EXISTS nota_dez_db;
CREATE DATABASE nota_dez_db;
USE nota_dez_db;

-- ===============================
-- TABELAS PRINCIPAIS
-- ===============================

CREATE TABLE institutions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE professors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE, 
    phone VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE professor_institutions (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36),
    professor_id VARCHAR(36),
    CONSTRAINT fk_profinst_institution FOREIGN KEY (institution_id) 
        REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT fk_profinst_professor FOREIGN KEY (professor_id) 
        REFERENCES professors(id) ON DELETE RESTRICT
);

CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    institution_id VARCHAR(36),
    CONSTRAINT fk_courses_institution FOREIGN KEY (institution_id) 
        REFERENCES institutions(id) ON DELETE CASCADE
);

-- Subjects
CREATE TABLE subjects (
    id VARCHAR(36) PRIMARY KEY,
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
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36),
    name VARCHAR(255),
    classroom VARCHAR(255),
    CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- Students
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    registration_id VARCHAR(255) UNIQUE
);

-- Formula notas finais
CREATE TABLE subject_final_formula (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36) NOT NULL,
    formula_text VARCHAR(255) NOT NULL,
    CONSTRAINT fk_formula_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- Grades (nota final por aluno na disciplina)
CREATE TABLE grades (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36),
    subject_id VARCHAR(36),
    final_grade DECIMAL(10,2),
    entry_date DATE,
    CONSTRAINT fk_grade_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_grade_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- Componentes de nota (ex: P1 / P2 / Trabalho)
CREATE TABLE grade_components (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36),
    name VARCHAR(255),
    formula_acronym VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT fk_gradecomp_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- Valores de nota dos componentes por aluno
CREATE TABLE grade_component_values (
    id VARCHAR(36) PRIMARY KEY,
    component_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    grade_value DECIMAL(10,2),
    CONSTRAINT fk_compvalues_component FOREIGN KEY (component_id)
        REFERENCES grade_components(id) ON DELETE CASCADE,
    CONSTRAINT fk_compvalues_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE
);

-- Alunos em turmas
CREATE TABLE class_students (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36),
    student_id VARCHAR(36),
    CONSTRAINT fk_classstudents_class FOREIGN KEY (class_id)
        REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_classstudents_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE RESTRICT
);

-- Auditoria
CREATE TABLE audits (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP,
    change_description VARCHAR(255),
    professor_id VARCHAR(36),
    CONSTRAINT fk_audits_professor FOREIGN KEY (professor_id) 
        REFERENCES professors(id) ON DELETE SET NULL
);

-- ===============================
-- PROCEDURE DE AUDITORIA
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
        UUID(),
        NOW(),
        p_change_description,
        p_professor_id
    );
END$$

-- ===============================
-- TABELA DA FÓRMULA FINAL
-- ===============================

CREATE TABLE subject_final_formula (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36),
    formula_text VARCHAR(255),
    CONSTRAINT fk_formula_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE CASCADE
);

-- ===============================
-- VALIDAR FÓRMULA
-- ===============================

DELIMITER $$

CREATE PROCEDURE validate_formula(
    IN p_subject_id VARCHAR(36),
    IN p_formula TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cmp VARCHAR(255);
    DECLARE msg TEXT;

    -- 1) Validar caracteres válidos
    -- Apenas: letras, números, PONTO, operadores, parenteses e espaços
    IF p_formula REGEXP '[^A-Za-z0-9_+\\-*/(). ]' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: A fórmula contém caracteres inválidos.';
    END IF;

    -- 2) Garantir que parênteses estão balanceados
    IF LENGTH(p_formula) - LENGTH(REPLACE(p_formula, '(', '')) <>
       LENGTH(p_formula) - LENGTH(REPLACE(p_formula, ')', '')) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: Parênteses desbalanceados na fórmula.';
    END IF;

    -- 3) Verificar se TODOS os componentes existentes aparecem na fórmula
    DECLARE cur CURSOR FOR 
        SELECT formula_acronym
        FROM grade_components
        WHERE subject_id = p_subject_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    check_components_loop: LOOP
        FETCH cur INTO cmp;
        IF done THEN LEAVE check_components_loop; END IF;

        IF INSTR(p_formula, cmp) = 0 THEN
            SET msg = CONCAT('Erro: A fórmula não contém o componente obrigatório: ', cmp);
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
        END IF;
    END LOOP;

    CLOSE cur;

    -- 4) Agora verificar SE A FÓRMULA NÃO CONTÉM COMPONENTES DESCONHECIDOS
    ----------------------------------------------------------
    -- Pega todos os tokens do tipo "IDENTIFICADOR" (A-Z0-9_)
    ----------------------------------------------------------
    CREATE TEMPORARY TABLE formula_tokens (
        token VARCHAR(255)
    );

    INSERT INTO formula_tokens(token)
    SELECT DISTINCT token
    FROM (
        SELECT REGEXP_SUBSTR(p_formula, '[A-Za-z0-9_]+', 1, n) AS token
        FROM numbers
        WHERE n <= LENGTH(p_formula)
    ) AS t
    WHERE token IS NOT NULL;

    -- Remover números (não são identificadores inválidos)
    DELETE FROM formula_tokens WHERE token REGEXP '^[0-9]+$';

    -- Remover tokens válidos (que existem nos componentes)
    DELETE ft
    FROM formula_tokens ft
    JOIN grade_components gc
      ON gc.formula_acronym = ft.token
     AND gc.subject_id = p_subject_id;

    -- Se sobrar algo → é identificador inválido
    IF (SELECT COUNT(*) FROM formula_tokens) > 0 THEN
        SELECT token INTO cmp FROM formula_tokens LIMIT 1;

        SET msg = CONCAT('Erro: A fórmula contém um componente inexistente: ', cmp);
        DROP TEMPORARY TABLE formula_tokens;

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    DROP TEMPORARY TABLE formula_tokens;

END$$

DELIMITER ;


-- TRIGGERS DE VALIDAÇÃO
CREATE TRIGGER tg_formula_before_insert
BEFORE INSERT ON subject_final_formula
FOR EACH ROW
BEGIN
    CALL validate_formula(NEW.subject_id, NEW.formula_text);
END$$

CREATE TRIGGER tg_formula_before_update
BEFORE UPDATE ON subject_final_formula
FOR EACH ROW
BEGIN
    CALL validate_formula(NEW.subject_id, NEW.formula_text);
END$$

-- ===============================
-- CÁLCULO AUTOMÁTICO DA NOTA FINAL
-- ===============================

CREATE PROCEDURE calculate_final_grade(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(36),
    OUT p_result DECIMAL(10,2)
)
BEGIN
    DECLARE formula TEXT;

    SELECT formula_text INTO formula
    FROM subject_final_formula
    WHERE subject_id = p_subject_id;

    DECLARE done INT DEFAULT FALSE;
    DECLARE cmp VARCHAR(255);
    DECLARE val DECIMAL(10,2);

    DECLARE cur CURSOR FOR
        SELECT gc.formula_acronym, gcv.grade_value
        FROM grade_components gc
        JOIN grade_component_values gcv ON gcv.component_id = gc.id
        WHERE gc.subject_id = p_subject_id
        AND gcv.student_id = p_student_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    repl_loop: LOOP
        FETCH cur INTO cmp, val;
        IF done THEN LEAVE repl_loop; END IF;

        SET formula = REPLACE(formula, cmp, val);
    END LOOP;

    CLOSE cur;

    SET @q = CONCAT('SELECT (', formula, ') INTO @res;');
    PREPARE stmt FROM @q;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET p_result = @res;
END$$

-- PROCEDURE PARA ATUALIZAR A NOTA FINAL DO ALUNO
CREATE PROCEDURE recalc_student_final_grade(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(36)
)
BEGIN
    DECLARE f DECIMAL(10,2);
    CALL calculate_final_grade(p_student_id, p_subject_id, f);

    UPDATE grades
    SET final_grade = f
    WHERE student_id = p_student_id
      AND subject_id = p_subject_id;
END$$

-- ===============================
-- TRIGGERS PARA RE-CÁLCULO
-- ===============================

CREATE TRIGGER tg_update_final_after_insert
AFTER INSERT ON grade_component_values
FOR EACH ROW
BEGIN
    CALL recalc_student_final_grade(
        NEW.student_id,
        (SELECT subject_id FROM grade_components WHERE id = NEW.component_id)
    );
END$$

CREATE TRIGGER tg_update_final_after_update
AFTER UPDATE ON grade_component_values
FOR EACH ROW
BEGIN
    CALL recalc_student_final_grade(
        NEW.student_id,
        (SELECT subject_id FROM grade_components WHERE id = NEW.component_id)
    );
END$$

CREATE TRIGGER tg_update_final_after_delete
AFTER DELETE ON grade_component_values
FOR EACH ROW
BEGIN
    CALL recalc_student_final_grade(
        OLD.student_id,
        (SELECT subject_id FROM grade_components WHERE id = OLD.component_id)
    );
END$$

DELIMITER ;
