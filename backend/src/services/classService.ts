// Autor: Allan Giovanni Matias Paes

import { ClassRegisterRequestDTO, ClassResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";
import { DatabaseClient } from "../db/DBClient";
import { ClassDataModel, CourseDataModel, InstitutionDataModel, SubjectDataModel } from "dataModels";

const db = new DatabaseClient();
const institutionTable = db.table<InstitutionDataModel>('institutions');
const subjectTable = db.table<SubjectDataModel>('subjects');
const courseTable = db.table<CourseDataModel>('courses');
const classTable = db.table<ClassDataModel>('classes');


export async function insertClass(data: ClassRegisterRequestDTO): Promise<ClassResponseDTO> {
    const {subject_id, institution_id, course_id, name, classroom_location, class_time, class_date} = data;
    const institution = await institutionTable.findUnique({id: institution_id});

    if (!institution){
        throw new AppError(404, 'Institution not found.');
    }

    const course = await courseTable.findUnique({id: course_id});

    if (!course){
        throw new AppError(404, 'Course not found.');
    }

    const subject = await subjectTable.findUnique({id: subject_id});
    
    if (!subject){
        throw new AppError(404, 'Subject not found.');
    }

    const classId = await classTable.insert({subject_id, name, classroom_location, class_time, class_date});
    const class_ = await classTable.findUnique({id: classId});

    if (!class_){
        throw new AppError(404, 'Class not found.');
    }

    return {
        id: classId,
        subject_id,
        name, 
        classroom_location,
        class_time,
        class_date
    }
}