import { ClassDataModel, ClassStudentsDataModel, StudentDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { StudentDTO, StudentResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";

const db = new DatabaseClient();
const studentTable = db.table<StudentDataModel>('students');
const classStudentsTable = db.table<ClassStudentsDataModel>('class_students');
const classTable = db.table<ClassDataModel>('classes');

export async function insertStudentIntoAClass(student: StudentDTO, classId: string): Promise<StudentResponseDTO> {
    
    const class_ = await classTable.findUnique({id: classId});
    
    if (!class_) throw new AppError(404, 'Class not Found.');

    const studentAlreadyExist = await studentTable.findUnique({registration_id: student.registration_id});
    let {id, name, registration_id} = student as StudentResponseDTO;

    if (!studentAlreadyExist){
        id = await studentTable.insert(student);
    } else {
        id = studentAlreadyExist.id
    }

    const studentIsAlreadyInThisClass = await classStudentsTable.findMany({
        student_id: id, 
        class_id: classId
    });

    if (studentIsAlreadyInThisClass.length === 0){
        console.warn('Student already inserted');
        await classStudentsTable.insert({student_id: id, class_id: classId});
    }

    return {id, name, registration_id};
}

