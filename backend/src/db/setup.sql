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

CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36),
    name VARCHAR(255),
    classroom VARCHAR(255),
    CONSTRAINT fk_classes_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    registration_id VARCHAR(255) UNIQUE
);

CREATE TABLE subject_final_formula (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36) NOT NULL,
    formula_text VARCHAR(255) NOT NULL,
    CONSTRAINT fk_formula_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE CASCADE
);

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

CREATE TABLE grade_components (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36),
    name VARCHAR(255),
    formula_acronym VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT fk_gradecomp_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
);

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

CREATE TABLE class_students (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36),
    student_id VARCHAR(36),
    CONSTRAINT fk_classstudents_class FOREIGN KEY (class_id)
        REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_classstudents_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE RESTRICT
);

CREATE TABLE audits (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP,
    change_description VARCHAR(255),
    professor_id VARCHAR(36),
    CONSTRAINT fk_audits_professor FOREIGN KEY (professor_id) 
        REFERENCES professors(id) ON DELETE SET NULL
);

CREATE TABLE audit_grades (
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME NOT NULL,
    student_id VARCHAR(36),
    subject_id VARCHAR(36),
    component_id VARCHAR(36),
    old_value DECIMAL(10,2),
    new_value DECIMAL(10,2),
    message TEXT,
    CONSTRAINT fk_auditgrades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_auditgrades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_auditgrades_component FOREIGN KEY (component_id) REFERENCES grade_components(id) ON DELETE CASCADE
);

---

## 💾 Procedures e Funções

```sql
DELIMITER $$

-- PROCEDURE DE AUDITORIA GENÉRICA
CREATE PROCEDURE create_audit(
    IN p_professor_id VARCHAR(36),
    IN p_change_description VARCHAR(255)
)
BEGIN
    INSERT INTO audits (id, created_at, change_description, professor_id)
    VALUES (UUID(), NOW(), p_change_description, p_professor_id);
END$$

-- PROCEDURE PARA AUDITAR MUDANÇA DE NOTA
CREATE PROCEDURE audit_grade_change(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(36),
    IN p_component_id VARCHAR(36),
    IN p_old_value DECIMAL(10,2),
    IN p_new_value DECIMAL(10,2)
)
BEGIN
    DECLARE studentName VARCHAR(255);
    DECLARE formattedMsg TEXT;
    DECLARE dt VARCHAR(20);

    SELECT name INTO studentName FROM students WHERE id = p_student_id LIMIT 1;
    SET dt = DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i:%s');

    SET formattedMsg = CONCAT(
        dt, ' - (Aluno ', COALESCE(studentName, 'Desconhecido'), ') - Nota de ',
        COALESCE(CAST(p_old_value AS CHAR), 'NULL'), ' para ',
        COALESCE(CAST(p_new_value AS CHAR), 'NULL'), ' modificada e salva.'
    );

    INSERT INTO audit_grades (id, created_at, student_id, subject_id, component_id, old_value, new_value, message)
    VALUES (UUID(), NOW(), p_student_id, p_subject_id, p_component_id, p_old_value, p_new_value, formattedMsg);
END$$

-- PROCEDURE DE VALIDAÇÃO DE FÓRMULA (MANTIDA ORIGINALMENTE)
CREATE PROCEDURE validate_formula(
    IN p_subject_id VARCHAR(36),
    IN p_formula TEXT
)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE len INT DEFAULT 0;
    DECLARE ch CHAR(1) DEFAULT '';
    DECLARE buffer VARCHAR(255) DEFAULT '';
    DECLARE token VARCHAR(255) DEFAULT '';
    DECLARE validComponent INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    DECLARE cmp VARCHAR(255) DEFAULT '';
    DECLARE msg TEXT DEFAULT '';

    DECLARE cur CURSOR FOR 
        SELECT formula_acronym FROM grade_components WHERE subject_id = p_subject_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET len = CHAR_LENGTH(p_formula);

    IF p_formula REGEXP '[^A-Za-z0-9_+\\-*/(). ]' THEN
        SET msg = 'Erro: A fórmula contém caracteres inválidos.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    IF (CHAR_LENGTH(p_formula) - CHAR_LENGTH(REPLACE(p_formula, '(', ''))) <>
       (CHAR_LENGTH(p_formula) - CHAR_LENGTH(REPLACE(p_formula, ')', ''))) THEN
        SET msg = 'Erro: Parênteses desbalanceados.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

    OPEN cur;
    component_loop: LOOP
        FETCH cur INTO cmp;
        IF done THEN LEAVE component_loop; END IF;
        IF INSTR(p_formula, cmp) = 0 THEN
            SET msg = CONCAT('Erro: A fórmula não contém o componente obrigatório: ', cmp);
            CLOSE cur;
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
        END IF;
    END LOOP;
    CLOSE cur;

    SET i = 1; SET buffer = '';
    WHILE i <= len DO
        SET ch = SUBSTRING(p_formula, i, 1);
        IF ch REGEXP '[A-Za-z0-9_]' THEN
            SET buffer = CONCAT(buffer, ch);
        ELSE
            IF buffer <> '' THEN
                SET token = buffer;
                IF token NOT REGEXP '^[0-9]+$' THEN
                    SELECT COUNT(*) INTO validComponent FROM grade_components
                    WHERE subject_id = p_subject_id AND formula_acronym = token;
                    IF validComponent = 0 THEN
                        SET msg = CONCAT('Erro: A fórmula contém um componente inexistente: ', token);
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
                    END IF;
                END IF;
                SET buffer = '';
            END IF;
        END IF;
        SET i = i + 1;
    END WHILE;

    IF buffer <> '' THEN
        SET token = buffer;
        IF token NOT REGEXP '^[0-9]+$' THEN
            SELECT COUNT(*) INTO validComponent FROM grade_components
            WHERE subject_id = p_subject_id AND formula_acronym = token;
            IF validComponent = 0 THEN
                SET msg = CONCAT('Erro: A fórmula contém um componente inexistente: ', token);
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
            END IF;
        END IF;
    END IF;
END$$

-- PROCEDURE PARA CALCULAR UMA NOTA FINAL (Sem Update, apenas retorna)
DROP PROCEDURE IF EXISTS calculate_final_grade$$

CREATE PROCEDURE calculate_final_grade(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(36),
    OUT p_result DECIMAL(10,2)
)
BEGIN
    DECLARE formula TEXT DEFAULT NULL;
    DECLARE done INT DEFAULT FALSE;
    DECLARE cmp VARCHAR(255) DEFAULT '';
    DECLARE val DECIMAL(10,2) DEFAULT 0.0;

    DECLARE cur CURSOR FOR
        SELECT gc.formula_acronym, COALESCE(gcv.grade_value, 0)
        FROM grade_components gc
        LEFT JOIN grade_component_values gcv 
          ON gcv.component_id = gc.id AND gcv.student_id = p_student_id
        WHERE gc.subject_id = p_subject_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    main_block: BEGIN
        SELECT formula_text INTO formula
        FROM subject_final_formula
        WHERE subject_id = p_subject_id LIMIT 1;

        IF formula IS NULL THEN
            SET p_result = NULL;
            LEAVE main_block;
        END IF;

        OPEN cur;
        repl_loop: LOOP
            FETCH cur INTO cmp, val;
            IF done THEN LEAVE repl_loop; END IF;
            SET formula = REPLACE(formula, cmp, CAST(val AS CHAR));
        END LOOP;
        CLOSE cur;

        SET @q = CONCAT('SELECT (', formula, ') INTO @res;');
        PREPARE stmt FROM @q;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET p_result = @res;
    END main_block;
END$$

-- PROCEDURE CRÍTICA: RECÁLCULO E UPDATE DA NOTA FINAL
DROP PROCEDURE IF EXISTS recalc_student_final_grade$$

CREATE PROCEDURE recalc_student_final_grade(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(36)
)
BEGIN
    DECLARE formula TEXT DEFAULT NULL;
    DECLARE tmp_formula TEXT DEFAULT '';
    DECLARE done INT DEFAULT FALSE;
    DECLARE cmp VARCHAR(255) DEFAULT '';
    DECLARE val DECIMAL(10,2) DEFAULT 0.0;
    DECLARE calc_result DECIMAL(10,2) DEFAULT NULL;

    DECLARE cur CURSOR FOR
        SELECT gc.formula_acronym, IFNULL(gcv.grade_value, 0)
        FROM grade_components gc
        LEFT JOIN grade_component_values gcv
          ON gcv.component_id = gc.id AND gcv.student_id = p_student_id
        WHERE gc.subject_id = p_subject_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    main_block: BEGIN
        SELECT formula_text INTO formula
        FROM subject_final_formula
        WHERE subject_id = p_subject_id LIMIT 1;

        IF formula IS NULL THEN
            UPDATE grades
            SET final_grade = NULL
            WHERE student_id = p_student_id AND subject_id = p_subject_id;
            LEAVE main_block;
        END IF;

        SET tmp_formula = formula;
        SET done = FALSE;

        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO cmp, val;
            IF done THEN LEAVE read_loop; END IF;
            SET tmp_formula = REPLACE(tmp_formula, cmp, CAST(val AS CHAR));
        END LOOP;
        CLOSE cur;

        -- Avaliar a expressão montada
        SET @expr := tmp_formula;
        SET @q := CONCAT('SELECT (', @expr, ') INTO @res;');
        PREPARE stmt FROM @q;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET calc_result = @res;

        -- **ATUALIZA A NOTA FINAL**
        UPDATE grades
        SET final_grade = calc_result
        WHERE student_id = p_student_id AND subject_id = p_subject_id;
    END main_block;
END$$

DELIMITER ;

---

## 🚀 O Gatilho de Recálculo (A Solução)

O código abaixo é o que garante o comportamento solicitado: quando a coluna `formula_text` da tabela `subject_final_formula` é alterada, ele dispara o recálculo para **todos os alunos** afetados.

```sql
DELIMITER $$

DROP TRIGGER IF EXISTS tg_recalc_all_after_formula_update$$

CREATE TRIGGER tg_recalc_all_after_formula_update
AFTER UPDATE ON subject_final_formula
FOR EACH ROW
BEGIN
    -- Declares
    DECLARE done INT DEFAULT FALSE;
    DECLARE st_id VARCHAR(36);

    -- Cursor listando alunos que têm nota na disciplina cuja fórmula foi alterada
    DECLARE cur CURSOR FOR
        SELECT student_id
        FROM grades
        WHERE subject_id = NEW.subject_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- **Ação principal: se a fórmula mudou, inicia o recálculo**
    IF OLD.formula_text <> NEW.formula_text THEN
        
        -- Inserir uma auditoria se necessário (opcional)
        -- CALL create_audit(NULL, CONCAT('Fórmula da disciplina ', NEW.subject_id, ' alterada de ', OLD.formula_text, ' para ', NEW.formula_text, '. Recalculando notas.'));

        OPEN cur;

        recalc_loop: LOOP
            FETCH cur INTO st_id;
            IF done THEN LEAVE recalc_loop; END IF;

            -- Chama a procedure que calcula a nota final e a salva na tabela grades
            CALL recalc_student_final_grade(st_id, NEW.subject_id);
        END LOOP;

        CLOSE cur;
    END IF;
END$$

DELIMITER ;