// Autor: Cristian Eduardo Fava
import bcrypt from "bcrypt";

import { ProfessorResponseDTO } from "dtos";
import { ProfessorDataModel } from "dataModels";

// DB
import { DatabaseClient } from "../db/DBClient";
import { Request } from "express";
import { AppError } from "../errors/AppError";
import jwt from 'jsonwebtoken';


// Instanciando o objeto do banco de dados e pegando a tabela do professor.
const db = new DatabaseClient();
const professorTable = db.table<ProfessorDataModel>("professors");
const SALT_ROUNDS = 10;

export async function Login(email: string, password: string): Promise<ProfessorResponseDTO> {

    // Tentando encontrar um único professor.
    const professor = await professorTable.findUnique({
        email: email
    });

    // Verificando se existe professor e Comparando a senha vindo do body com a registrada (criptografada) no banco de dados. 
    if (!professor || !bcrypt.compareSync(password, professor.password)) {
        throw new AppError(401,"Invalid email or password!")
    }

    return {
        id: professor.id,
        email,
        name: professor.name,
        phone: professor.phone,
        created_at: professor.created_at
    }
}

export async function Register(email: string, password: string, name: string, phone: string) {
    
    // Tentando encontrar um único professor.
    const professor = await professorTable.findUnique({
        email
    });


    // Se já existir professor, lança um erro.
    if (professor !== null) {
        throw new AppError(409, "Email already exist!");
    }
    
    const createdAt = new Date(); // Cria um objeto Date válido

    // Criptografando a senha fornecida.
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);

    // Inserindo o dado.
    professorTable.insert({
        email,
        name,
        phone,
        password: hash,
        created_at: createdAt
    });
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function getLoggedUser(authHeader: string): Promise<ProfessorResponseDTO | null> {
    try {
        // Pega o jwt
        if (!authHeader) return null;

        const [, token] = authHeader.split(' '); // "Bearer <token>"
        if (!token) return null;

        // Extrai os dados do usuario
        const decoded = jwt.verify(token, JWT_SECRET) as ProfessorResponseDTO;

        // Pega o id do Payload e retorna o objeto completo
        const {id, email, name, phone, created_at} = await professorTable.findUnique({id: decoded.id}) as ProfessorResponseDTO;
        return {id, email, name, phone, created_at};

    } catch (err) {
        console.error('Invalid token:', err);
        return null;
    }
}