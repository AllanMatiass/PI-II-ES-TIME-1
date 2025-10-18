// Autor: Cristian Eduardo Fava
import bcrypt from "bcrypt";

import { ProfessorResponseDTO } from "dtos";
import { ProfessorDataModel } from "dataModels";

// DB
import { DatabaseClient } from "../db/DBClient";
import { Request } from "express";

const SALT_ROUNDS = 10;

export async function Login(email: string, password: string): Promise<ProfessorResponseDTO> {
    // Instanciando o objeto do banco de dados e pegando a tabela do professor.
    const db = new DatabaseClient();
    const professorTable = db.table<ProfessorDataModel>("professors");
    
    
    console.log(await professorTable.findMany()); 

    // Tentando encontrar um único professor.
    const professor = await professorTable.findUnique({
        email: email
    });

    // Verificando se existe professor e Comparando a senha vindo do body com a registrada (criptografada) no banco de dados. 
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
    // Instanciando o objeto do banco de dados e pegando a tabela do professor.
    const db = new DatabaseClient();
    const professorTable = db.table<ProfessorDataModel>("professors");

    console.log('Ta vino no registro?');
    
    // Tentando encontrar um único professor.
    const professor = await professorTable.findUnique({
        email
    });


    // Se já existir professor, lança um erro.
    if (professor != null) {
        throw new Error("Invalid email!");
    }
    
    const now = new Date();
    const timestamp = now.getTime();

    // Criptografando a senha fornecida.
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);

    // Inserindo o dado.
    professorTable.insert({
        email,
        name,
        phone,
        password: hash,
        created_at: timestamp
    });
}

export function getLoggedUser(req: Request): ProfessorResponseDTO | null {
	const user = req.session.user != null ? req.session.user as ProfessorResponseDTO : null;
	return user;
}