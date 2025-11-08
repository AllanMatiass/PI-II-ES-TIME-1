import { StudentDTO, StudentResponseDTO } from "dtos";
import { Request, Response } from "express";
import { insertStudentIntoAClass } from "../services/studentService";
import { AppError } from "../errors/AppError";

export async function insertStudent(req: Request, res: Response) {
    try{
         const classId = req.params.classId;
        if (!classId) throw new AppError(404, 'Class not found.');
        
        const {name, registration_id} = req.body as StudentDTO;
        const student = await insertStudentIntoAClass({name, registration_id}, classId) as StudentResponseDTO;

        return res.json({
            message: 'Student was inserted successfully.',
            data: student
        });
        
    } catch (err: any){
        if (err instanceof AppError) {
			return res.status(err.code).json({ error: err.message });
		}

		console.error(err);
		return res.status(500).json({ error: 'Unexpected Error' });
    }
   
    
}