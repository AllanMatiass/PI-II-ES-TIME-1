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

export async function findAllClasses(): Promise<ClassResponseDTO[]> {
    const class_ = await classTable.findMany() || [];

    return class_;
}

export async function findClassByID(id: string): Promise<ClassResponseDTO> {
    const class_ = await classTable.findUnique({id});

    if (!class_){
        throw new AppError(404, 'Class not found.');
    }

    return class_;
}

export async function findClassBySubjectId(subId: string): Promise<ClassResponseDTO[]> {
    const subject = await subjectTable.findUnique({id: subId});
    
    if (!subject){
        throw new AppError(404, 'Subject not found.');
    }

    const classes = await classTable.findMany({
        subject_id: subId
    }) || [];

    return classes;   
}

export async function updateClass(id: string, data: Partial<ClassRegisterRequestDTO>): Promise<ClassResponseDTO> {
    const classExist = await classTable.findUnique({ id });
    if (!classExist) {
        throw new AppError(404, 'Class not found.');
    }

    // Cria um objeto só com os campos que mudaram
    const updateData: Partial<ClassRegisterRequestDTO> = {};

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            // @ts-ignore
            if (classExist[key] && data[key] !== classExist[key]) {
                // @ts-ignore
                updateData[key] = data[key];
            }
        }
    }

    // Se não houver alterações, retorna a própria classe
    if (Object.keys(updateData).length === 0) {
        return classExist;
    }

    // Atualiza apenas os campos que mudaram
    await classTable.update(data, {id});
    const updatedClass = await classTable.findUnique({ id });

    if (!updatedClass) {
        throw new AppError(500, 'Something wrong happened');
    }
    
    return updatedClass;
}