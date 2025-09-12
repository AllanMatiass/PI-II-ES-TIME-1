const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');


async function seed() {
    // Conexão com o banco
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'nota_dez_db'
    });

    try {
        // ===============================
        // INSTITUIÇÕES
        // ===============================
        const institutions = [
            { id: uuidv4(), name: 'Instituto Exemplo' },
            { id: uuidv4(), name: 'Universidade Demo' }
        ];

        for (const i of institutions) {
            await connection.query(
                'INSERT INTO institution (id, name) VALUES (?, ?)',
                [i.id, i.name]
            );
        }

        // ===============================
        // PROFESSORES
        // ===============================
        const professors = [
            { id: uuidv4(), name: 'João Silva', email: 'joao@exemplo.com', phone: '11999999999', password: 'senha123' },
            { id: uuidv4(), name: 'Maria Oliveira', email: 'maria@demo.com', phone: '21988888888', password: 'senha456' }
        ];

        for (const p of professors) {
            await connection.query(
                'INSERT INTO professor (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
                [p.id, p.name, p.email, p.phone, p.password]
            );
        }

        // ===============================
        // CURSOS
        // ===============================
        const courses = [
            { id: uuidv4(), name: 'Engenharia de Software', code: 'ENGSOFT', institutionId: institutions[0].id },
            { id: uuidv4(), name: 'Ciência da Computação', code: 'CCOMP', institutionId: institutions[1].id }
        ];

        for (const c of courses) {
            await connection.query(
                'INSERT INTO course (id, name, code, institutionId) VALUES (?, ?, ?, ?)',
                [c.id, c.name, c.code, c.institutionId]
            );
        }

        // ===============================
        // MATÉRIAS
        // ===============================
        const subjects = [
            { id: uuidv4(), name: 'Programação Web', acronym: 'PW', period: '1º Semestre', formula: null, courseId: courses[0].id },
            { id: uuidv4(), name: 'Estruturas de Dados', acronym: 'ED', period: '1º Semestre', formula: null, courseId: courses[1].id }
        ];

        for (const s of subjects) {
            await connection.query(
                'INSERT INTO subject (id, name, acronym, period, formula, courseId) VALUES (?, ?, ?, ?, ?, ?)',
                [s.id, s.name, s.acronym, s.period, s.formula, s.courseId]
            );
        }

        // ===============================
        // COMPONENTES DE NOTA
        // ===============================
        const gradeComponents = [
            // Programação Web
            { id: uuidv4(), subjectId: subjects[0].id, name: 'Trabalho 1', acronym: 'T1', weight: 0.2 },
            { id: uuidv4(), subjectId: subjects[0].id, name: 'Prova 1', acronym: 'P1', weight: 0.3 },
            { id: uuidv4(), subjectId: subjects[0].id, name: 'Prova Final', acronym: 'PF', weight: 0.5 },
            // Estruturas de Dados
            { id: uuidv4(), subjectId: subjects[1].id, name: 'Trabalho 1', acronym: 'T1', weight: 0.25 },
            { id: uuidv4(), subjectId: subjects[1].id, name: 'Prova 1', acronym: 'P1', weight: 0.25 },
            { id: uuidv4(), subjectId: subjects[1].id, name: 'Prova 2', acronym: 'P2', weight: 0.5 }
        ];

        for (const gc of gradeComponents) {
            await connection.query(
                'INSERT INTO grade_component (id, subjectId, name, acronym, weight) VALUES (?, ?, ?, ?, ?)',
                [gc.id, gc.subjectId, gc.name, gc.acronym, gc.weight]
            );
        }

        // ===============================
        // ESTUDANTES
        // ===============================
        const students = [
            { id: uuidv4(), registration: '2025001', name: 'Carlos Santos' },
            { id: uuidv4(), registration: '2025002', name: 'Ana Pereira' }
        ];

        for (const st of students) {
            await connection.query(
                'INSERT INTO student (id, registration, name) VALUES (?, ?, ?)',
                [st.id, st.registration, st.name]
            );
        }

        // ===============================
        // TURMAS
        // ===============================
        const classGroups = [
            { id: uuidv4(), name: 'PW - Turma A', code: 'PW-A', subjectId: subjects[0].id },
            { id: uuidv4(), name: 'ED - Turma B', code: 'ED-B', subjectId: subjects[1].id }
        ];

        for (const cg of classGroups) {
            await connection.query(
                'INSERT INTO classgroup (id, name, code, subjectId) VALUES (?, ?, ?, ?)',
                [cg.id, cg.name, cg.code, cg.subjectId]
            );
        }

        // ===============================
        // ASSOCIAR ESTUDANTES A TURMAS
        // ===============================
        await connection.query(
            'INSERT INTO student_classgroup (studentId, classGroupId) VALUES (?, ?), (?, ?)',
            [students[0].id, classGroups[0].id, students[1].id, classGroups[1].id]
        );

        // ===============================
        // NOTAS
        // ===============================
        const grades = [
            // Carlos Santos - PW
            { id: uuidv4(), studentId: students[0]?.id, componentId: gradeComponents[0].id, value: 8.5 }, // T1
            { id: uuidv4(), studentId: students[0].id, componentId: gradeComponents[1].id, value: 7.0 }, // P1
            { id: uuidv4(), studentId: students[0].id, componentId: gradeComponents[2].id, value: 9.0 }, // PF
            // Ana Pereira - ED
            { id: uuidv4(), studentId: students[1].id, componentId: gradeComponents[3].id, value: 9.0 }, // T1
            { id: uuidv4(), studentId: students[1].id, componentId: gradeComponents[4].id, value: 8.0 }, // P1
            { id: uuidv4(), studentId: students[1].id, componentId: gradeComponents[5].id, value: 7.5 }  // P2
        ];

        for (const g of grades) {
            await connection.query(
                'INSERT INTO grade (id, studentId, componentId, value) VALUES (?, ?, ?, ?)',
                [g.id, g.studentId, g.componentId, g.value]
            );
        }

        console.log('Seed concluída com sucesso!');
        await connection.end();

    } catch (err) {
        console.error('Erro ao popular o banco:', err);
        await connection.end();
    }
}

// Executar a seed
seed();
