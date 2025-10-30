import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { ClassRegisterRequestDTO } from "dtos";
import { findClassByID, insertClass } from "../services/classService";

export async function POST_insertClass(req: Request, res: Response) {
    try{
        
    const { subject_id, institution_id, course_id, name, classroom_location, class_time, class_date } = req.body || {};

    // Verifica se o body existe
    if (!req.body) {
      throw new AppError(400, "Body must contain subject_id, institution_id, course_id, name, classroom_location, class_time and class_date.");
    }

    // Verifica campos obrigatórios
    const requiredFields = { subject_id, institution_id, course_id, name, classroom_location, class_time, class_date };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
        throw new AppError(400, `Field '${key}' is required.`);
      }
    }

    // Sanitização e validações extras
    const sanitizedData = {
      subject_id: String(subject_id),
      institution_id: String(institution_id),
      course_id: String(course_id),
      name: String(name).trim(),
      classroom_location: String(classroom_location).trim(),
      class_time: String(class_time).trim(),
      class_date: new Date(String(class_date).trim())
    } as ClassRegisterRequestDTO;


    // Verificação para ver se está no formato HH:MM.
    if (!/^\d{2}:\d{2}$/.test(sanitizedData.class_time)) {
      throw new AppError(400, "class_time must be in 'HH:MM' format.");
    }

    const class_ = await insertClass(sanitizedData);
    res.status(201).json({
         message: "Class created successfully", 
         data: class_ 
    });

    } catch(err){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }
        
        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
    
}

export async function GET_findClassByID(req: Request, res: Response) {
    try{
        const { params } = req;
         // Verifica se o body existe
        if (!req.params || !params.id) {
            throw new AppError(400, "You must provide the class ID as a parameter.");
        }

        const class_ = await findClassByID(params.id);

        return res.json({
            messasge: 'Class found.',
            data: class_
        })

    } catch(err){
        if (err instanceof AppError){
            return res.status(err.code).json({error: err.message})
        }
        
        console.error(err);
        return res.status(500).json({error: 'Unexpected Error'});
    }
}