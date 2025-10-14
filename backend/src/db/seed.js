const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

/**
 * Função genérica para inserção em massa (bulk insert).
 * @param {mysql.Connection} connection - A conexão ativa com o banco.
 * @param {string} tableName - O nome da tabela.
 * @param {Array<Object>} data - Um array de objetos a serem inseridos.
 */
async function bulkInsert(connection, tableName, data) {
    if (data.length === 0) return;

    const keys = Object.keys(data[0]);
    const values = data.map(item => keys.map(key => item[key]));
    
    const sql = `INSERT INTO ${tableName} (\`${keys.join('`, `')}\`) VALUES ?`;
    await connection.query(sql, [values]);
}


async function seed() {
    // 1. Conexão com o banco
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'nota_dez_db'
    });

    try {
        // 2. Iniciar Transação: Garante que ou tudo funciona, ou nada é salvo.
        await connection.beginTransaction();
        console.log('Transação iniciada.');

        // ===============================
        // DADOS
        // Armazenar IDs em constantes para criar relações de forma segura
        // ===============================

        // Institutions
        const instExemploId = uuidv4();
        const uniDemoId = uuidv4();
        const institutionsData = [
            { InstitutionId: instExemploId, Name: 'Instituto Exemplo' },
            { InstitutionId: uniDemoId, Name: 'Universidade Demo' }
        ];

        // Professors
        const profJoaoId = uuidv4();
        const profMariaId = uuidv4();
        const professorsData = [
            { ProfessorId: profJoaoId, Name: 'João Silva', Email: 'joao@exemplo.com', PhoneNumber: '11999999999', Password: 'senha123', CreatedAt: new Date() },
            { ProfessorId: profMariaId, Name: 'Maria Oliveira', Email: 'maria@demo.com', PhoneNumber: '21988888888', Password: 'senha456', CreatedAt: new Date() }
        ];

        // ProfessorInstitutions
        const profInstJoaoId = uuidv4();
        const profInstMariaId = uuidv4();
        const professorInstitutionsData = [ // CORREÇÃO: Nome da variável para consistência
            { ProfessorInstitutionId: profInstJoaoId, InstitutionId: instExemploId, ProfessorId: profJoaoId },
            { ProfessorInstitutionId: profInstMariaId, InstitutionId: uniDemoId, ProfessorId: profMariaId }
        ];

        // Courses
        const courseEngSoftId = uuidv4();
        const courseCCompId = uuidv4();
        const coursesData = [
            { CourseId: courseEngSoftId, Name: 'Engenharia de Software', ProfessorInstitutionId: profInstJoaoId },
            { CourseId: courseCCompId, Name: 'Ciência da Computação', ProfessorInstitutionId: profInstMariaId }
        ];
        
        // Subjects
        const subjectPwId = uuidv4();
        const subjectEdId = uuidv4();
        const subjectsData = [
            { SubjectId: subjectPwId, CourseId: courseEngSoftId, Name: 'Programação Web', Code: 'PW', Acronym: 'PW', Period: 1, StartDate: new Date('2025-08-01'), EndDate: new Date('2025-12-15') },
            { SubjectId: subjectEdId, CourseId: courseCCompId, Name: 'Estruturas de Dados', Code: 'ED', Acronym: 'ED', Period: 1, StartDate: new Date('2025-08-01'), EndDate: new Date('2025-12-15') }
        ];

        // Classes
        const classPwAId = uuidv4();
        const classEdBId = uuidv4();
        const classesData = [
            { ClassId: classPwAId, SubjectId: subjectPwId, Name: 'PW - Turma A', ClassroomLocation: 'Sala 101', ClassTime: '19:00:00', ClassDate: new Date('2025-08-04') },
            { ClassId: classEdBId, SubjectId: subjectEdId, Name: 'ED - Turma B', ClassroomLocation: 'Lab 3', ClassTime: '21:00:00', ClassDate: new Date('2025-08-05') }
        ];

        // Students
        const studentCarlosId = uuidv4();
        const studentAnaId = uuidv4();
        const studentsData = [
            { StudentId: studentCarlosId, RegistrationID: '2025001', Name: 'Carlos Santos' },
            { StudentId: studentAnaId, RegistrationID: '2025002', Name: 'Ana Pereira' }
        ];

        // GradeComponents
        const gcPwT1Id = uuidv4(), gcPwP1Id = uuidv4(), gcPwPfId = uuidv4();
        const gcEdT1Id = uuidv4(), gcEdP1Id = uuidv4(), gcEdP2Id = uuidv4();
        const gradeComponentsData = [
            // CORREÇÃO: Adicionado o campo Description, que existe na tabela GradeComponents.
            { GradeComponentId: gcPwT1Id, ClassId: classPwAId, Name: 'Trabalho 1', FormulaAcronym: 'T1', Description: 'Primeiro trabalho prático.' },
            { GradeComponentId: gcPwP1Id, ClassId: classPwAId, Name: 'Prova 1', FormulaAcronym: 'P1', Description: 'Primeira prova parcial.' },
            { GradeComponentId: gcPwPfId, ClassId: classPwAId, Name: 'Prova Final', FormulaAcronym: 'PF', Description: 'Avaliação final da disciplina.' },
            { GradeComponentId: gcEdT1Id, ClassId: classEdBId, Name: 'Trabalho 1', FormulaAcronym: 'T1', Description: 'Implementação de listas.' },
            { GradeComponentId: gcEdP1Id, ClassId: classEdBId, Name: 'Prova 1', FormulaAcronym: 'P1', Description: 'Primeira avaliação teórica.' },
            { GradeComponentId: gcEdP2Id, ClassId: classEdBId, Name: 'Prova 2', FormulaAcronym: 'P2', Description: 'Segunda avaliação teórica.' }
        ];
        
        // Grades
        const gradeCarlosT1 = uuidv4(), gradeCarlosP1 = uuidv4(), gradeCarlosPF = uuidv4();
        const gradeAnaT1 = uuidv4(), gradeAnaP1 = uuidv4(), gradeAnaP2 = uuidv4();
        const gradesData = [
            // CORREÇÃO: Adicionados AdjustedFinalGrade e WasAdjusted com valores padrão.
            { GradeId: gradeCarlosT1, GradeComponentId: gcPwT1Id, AutomaticFinalGrade: 8.5, AdjustedFinalGrade: null, WasAdjusted: false, EntryDate: new Date() },
            { GradeId: gradeCarlosP1, GradeComponentId: gcPwP1Id, AutomaticFinalGrade: 7.0, AdjustedFinalGrade: null, WasAdjusted: false, EntryDate: new Date() },
            { GradeId: gradeCarlosPF, GradeComponentId: gcPwPfId, AutomaticFinalGrade: 9.0, AdjustedFinalGrade: null, WasAdjusted: false, EntryDate: new Date() },
            { GradeId: gradeAnaT1, GradeComponentId: gcEdT1Id, AutomaticFinalGrade: 9.0, AdjustedFinalGrade: 9.5, WasAdjusted: true, EntryDate: new Date() }, // Exemplo de nota ajustada
            { GradeId: gradeAnaP1, GradeComponentId: gcEdP1Id, AutomaticFinalGrade: 8.0, AdjustedFinalGrade: null, WasAdjusted: false, EntryDate: new Date() },
            { GradeId: gradeAnaP2, GradeComponentId: gcEdP2Id, AutomaticFinalGrade: 7.5, AdjustedFinalGrade: null, WasAdjusted: false, EntryDate: new Date() }
        ];

        // ClassStudents (Associando Alunos, Turmas e as Notas criadas)
        const classStudentsData = [
            { ClassStudentId: uuidv4(), ClassId: classPwAId, StudentId: studentCarlosId, GradeId: gradeCarlosT1 },
            { ClassStudentId: uuidv4(), ClassId: classPwAId, StudentId: studentCarlosId, GradeId: gradeCarlosP1 },
            { ClassStudentId: uuidv4(), ClassId: classPwAId, StudentId: studentCarlosId, GradeId: gradeCarlosPF },
            { ClassStudentId: uuidv4(), ClassId: classEdBId, StudentId: studentAnaId, GradeId: gradeAnaT1 },
            { ClassStudentId: uuidv4(), ClassId: classEdBId, StudentId: studentAnaId, GradeId: gradeAnaP1 },
            { ClassStudentId: uuidv4(), ClassId: classEdBId, StudentId: studentAnaId, GradeId: gradeAnaP2 },
        ];

        // ADIÇÃO: Populando a tabela FinalGradeCalculations para um seed mais completo.
        const finalGradeCalculationsData = [
            { FinalGradeCalculationId: uuidv4(), ClassId: classPwAId, Formula: '(T1 * 0.4) + (P1 * 0.6)' },
            { FinalGradeCalculationId: uuidv4(), ClassId: classEdBId, Formula: '(T1 * 0.2) + (P1 * 0.4) + (P2 * 0.4)' }
        ];

        // ===============================
        // INSERÇÃO EM MASSA (BULK INSERT)
        // ===============================
        console.log('Inserindo dados...');
        
        await bulkInsert(connection, 'Institutions', institutionsData);
        await bulkInsert(connection, 'Professors', professorsData);
        await bulkInsert(connection, 'ProfessorInstitutions', professorInstitutionsData);
        await bulkInsert(connection, 'Courses', coursesData);
        await bulkInsert(connection, 'Subjects', subjectsData);
        await bulkInsert(connection, 'Classes', classesData);
        await bulkInsert(connection, 'Students', studentsData);
        await bulkInsert(connection, 'GradeComponents', gradeComponentsData);
        await bulkInsert(connection, 'Grades', gradesData);
        await bulkInsert(connection, 'ClassStudents', classStudentsData);
        await bulkInsert(connection, 'FinalGradeCalculations', finalGradeCalculationsData);

        // 3. Efetivar Transação: Salva todas as alterações no banco.
        await connection.commit();
        console.log('Seed concluída com sucesso!');

    } catch (err) {
        // 4. Reverter Transação: Desfaz todas as alterações em caso de erro.
        console.error('Erro ao popular o banco, revertendo alterações...', err);
        await connection.rollback();

    } finally {
        // 5. Encerrar conexão
        console.log('Fechando conexão.');
        await connection.end();
    }
}

// Executar a seed
seed();