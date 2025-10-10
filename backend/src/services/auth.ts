import bcrypt from "bcrypt";

import { ProfessorResponseDTO } from "dtos";
import { ProfessorDataModel } from "dataModels";

// DB
import { DatabaseClient } from "../db/DBClient";

const SALT_ROUNDS = 10;

export async function Login(email: string, password: string): Promise<ProfessorResponseDTO> {
    const db = new DatabaseClient();
    const professorTable = db.table<ProfessorDataModel>("professor");

    const professor = await professorTable.findUnique({
        email
    });

    if (!professor || !bcrypt.compareSync(password, professor.password)) {
        throw new Error("Invalid email or password!")
    }

    return {
        id: professor.id,
        email,
        name: professor.name,
        phone: professor.phone
    }
}

export async function Register(email: string, password: string, name: string, phone: string) {
    const db = new DatabaseClient();
    const professorTable = db.table<ProfessorDataModel>("professor");

    const professor = await professorTable.findUnique({
        email
    });

    if (professor != null) {
        throw new Error("Invalid email!");
    }

    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);

    professorTable.insert({
        email,
        name,
        phone,
        password: hash
    });
}