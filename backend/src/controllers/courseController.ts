// CAutor: Cristian Eduardo Fava

import { CourseRegisterRequestDTO } from 'dtos';
import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { DeleteCouse, GetInstitutionCourses, insertCourse as InsertCourse, UpdateCourse } from '../services/courseService';
import { CourseDataModel } from 'dataModels';

export async function POST_CreateCourse(req: Request, res: Response) {
	const body: CourseRegisterRequestDTO = req.body;

	try {
		if (!body.name || !body.institution_id) {
			throw new AppError(400, 'Missing course name or institution ID.');
		}

		const course = await InsertCourse(body);

		if (course == null) {
			throw new AppError(500, 'Unable to register course. Try again later!');
		}

		res.status(200).json({
			message: 'Course registered successfully',
			data: course,
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function PUT_UpdateCourse(req: Request, res: Response) {
	
	try {
		const body: CourseDataModel = req.body;
		const courseId = req.params["course_id"];
		
		if (!courseId) {
			throw new AppError(400, 'Missing param course id.');
		}
		
		if (!body.name) {
			throw new AppError(400, 'Missing course name.');
		}

		const success = await UpdateCourse(body.name, courseId);

		if (!success) {
			throw new AppError(500, 'Unable to updated course. Try again later!');
		}

		res.status(200).json({
			message: 'Course updated successfully'
		});
	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function DELETE_DeleteCourse(req: Request, res: Response) {
	try {
		const courseId = req.params["course_id"];

		if (!courseId) {
			throw new AppError(400, "Missing param course id.");
		}

		const success = await DeleteCouse(courseId);

		if (!success) {
			throw new AppError(500, "Unable to delete course. Try again later.");
		}
		
		res.status(200).json({
			message: "Course deleted successfully."
		});

	} catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}

export async function GET_FindInstitutionCourses(req: Request, res: Response) {
    try {
        const institutionId = req.params["institution_id"];

        if (!institutionId) {
            throw new AppError(400, "Missing param institution id.");
        }

        const courses = await GetInstitutionCourses(institutionId);

        res.status(200).json({
            message: "Courses found successfully.",
            data: courses
        });
    } catch (err: any) {
		if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
	}
}