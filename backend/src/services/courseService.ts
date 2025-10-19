import { DatabaseClient } from "../db/DBClient";
import { CourseDataModel, InstitutionDataModel } from "dataModels";
import { AppError } from "../errors/AppError";
import { CourseRegisterRequestDTO } from "dtos";

const db: DatabaseClient = new DatabaseClient();

const institutionTable = db.table<InstitutionDataModel>('institutions');
const courseTable = db.table<CourseDataModel>('courses');

export async function insertCourse(dto: CourseRegisterRequestDTO): Promise<CourseDataModel | null> {
    const institutionExists = await institutionTable.findUnique({ id: dto.institution_id });

    if (!institutionExists) {
        throw new AppError(404, 'Institution does not exist.');
    }

    const courseId = await courseTable.insert(dto);
    const course = await courseTable.findUnique({
        id: courseId
    });

    return course;
}

export async function GetInstitutionCourses(institutionId: string): Promise<CourseDataModel[]> {
    const courses = await courseTable.findMany({
        institution_id: institutionId
    });

    return courses;
}

export async function UpdateCourse(newCourse: CourseDataModel): Promise<boolean> {
    const courseExists = await courseTable.findUnique({
        id: newCourse.id
    });

    if (!courseExists) {
        throw new AppError(404, 'Course does not exist.');
    }

    await courseTable.update(newCourse, {
        id: newCourse.id
    });

    return true;
}

export async function DeleteCouse(courseId: string): Promise<boolean> {
    const courseExists = await courseTable.findUnique({
        id: courseId
    });

    if (!courseExists) {
        throw new AppError(404, 'Course does not exist.');
    }

    await courseTable.deleteMany({
        id: courseId
    });

    return true;
}