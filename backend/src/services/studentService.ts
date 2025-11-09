// Autor: Allan Giovanni Matias Paes
import { ClassDataModel, ClassStudentsDataModel, StudentDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { StudentDTO, StudentResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";

// Instância da DB e tabelas usadas no código.
const db = new DatabaseClient();
const studentTable = db.table<StudentDataModel>('students');
const classStudentsTable = db.table<ClassStudentsDataModel>('class_students');
const classTable = db.table<ClassDataModel>('classes');

// Função para inserir um estudante em uma classe
export async function insertStudentIntoAClass(student: StudentDTO, classId: string): Promise<StudentResponseDTO> {
    
    // Verifica se a classe existe
    const class_ = await classTable.findUnique({id: classId});
    if (!class_) throw new AppError(404, 'Class not Found.');

    // Verifica se o estudante já existe pelo número de matrícula (registration_id)
    const studentAlreadyExist = await studentTable.findUnique({registration_id: student.registration_id});

    // Extrai os campos necessários para montar o retorno
    let {id, name, registration_id} = student as StudentResponseDTO;

    // Caso o estudante ainda não exista no banco, cria o registro e obtém o ID.
    if (!studentAlreadyExist){
        id = await studentTable.insert(student);
    } else {
        // Caso já exista, reaproveitamos o ID
        id = studentAlreadyExist.id;
    }

    // Verifica se o aluno já está vinculado à classe
    const studentIsAlreadyInThisClass = await classStudentsTable.findMany({
        student_id: id, 
        class_id: classId
    });

    // Se não houver vínculo, cria na tabela de relacionamento (class_students)
    if (studentIsAlreadyInThisClass.length === 0){
        console.warn('Student inserted successfully in this class');
        await classStudentsTable.insert({student_id: id, class_id: classId});
    }

    // Retorna os dados do estudante vinculados à classe
    return {id, name, registration_id};
}

export async function listStudentsInAClass(classId: string): Promise<StudentResponseDTO[]> {

    // Busca a classe pelo ID informado
    const class_ = await classTable.findUnique({id: classId});
    
    // Se a classe não existir, retorna erro
    if (!class_) throw new AppError(404, 'Class not Found.');

    // Busca todos os relacionamentos student <-> class
    const studentClasses = await classStudentsTable.findMany({
        class_id: classId
    });

    // Se não houver registros, retorna lista vazia
    if (studentClasses.length === 0) return [];


    // Para cada vínculo da tabela, buscamos o estudante na tabela students
    const students: StudentResponseDTO[] = [];
    
    for (const sc of studentClasses) {
        const student = await studentTable.findUnique({id: sc.student_id});

        // Caso algum registro da tabela esteja inconsistente (referência quebrada)
        if (!student) continue;

        // Estruturamos o retorno no formato StudentResponseDTO
        students.push({
            id: student.id,
            name: student.name,
            registration_id: student.registration_id
        });
    }

    // Retorna a lista de estudantes encontrados
    return students;
}