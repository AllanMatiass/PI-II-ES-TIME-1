// Autor: Allan Giovanni Matias Paes e Murilo Rigoni
import { ProfessorDataModel } from "dataModels";
import { DatabaseClient } from "../db/DBClient";
import { ProfessorResponseDTO } from "dtos";
import { AppError } from "../errors/AppError";
import { sendEmail } from "./emailService";
import crypto from "crypto";
import bcrypt from "bcryptjs"

// cria instância do banco
const db = new DatabaseClient();
// tabela de professores
const professorsTable = db.table<ProfessorDataModel>('professors');

export async function updateProfessor(_id: string, update: Partial<ProfessorDataModel>) : Promise<ProfessorResponseDTO> {

    // verifica se o professor existe pelo id
    const professorExist = await professorsTable.findUnique({id:_id});
    if (!professorExist) throw new AppError(404, 'ID not found.');

    // remove campos undefined do objeto de atualização
    const updateData = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
    ) as Partial<ProfessorDataModel>;

    // atualiza o professor no banco
    await professorsTable.update(updateData, { id:_id });

    // busca novamente para retornar os dados atualizados
    const {id, name, email, phone, created_at} = await professorsTable.findUnique({ id:_id }) as ProfessorResponseDTO;

    // retorna somente os campos necessários
    return {id, name, email, phone, created_at}
}

export async function generateRecoveryToken(resetTokens: Map<number, string>, email: string) {
    const professor = await professorsTable.findUnique({email});


    if (!professor){
        throw new AppError(404, 'Professor não encontrado.');
    }
	
	// gera token e salva temporariamente
	const token = Math.floor(100000 + Math.random() * 900000);
	resetTokens.set(token, email);

	const subject = "Redefinição de senha - Sistema Nota Dez";
	const message = `
	  Você solicitou a redefinição da sua senha.<br><br>
	  O código para redefinição de senha é:<br>
	  <strong><p>${token}</p><strong><br><br>
	  Se você não solicitou, ignore este e-mail.
	`;

	// envia o e-mail
	const emailStatus = await sendEmail(email, message, subject);

	if (!emailStatus.success) {
        throw new AppError(500, 'Falha ao enviar e-mail.');
	}

    return token;
}

export async function recoverPassword(resetTokens: Map<number, string>,token: number, email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const professorExist= await professorsTable.findUnique({email});

    if (!professorExist){
        throw new AppError (404, "Professor não existe.");
    }

    await professorsTable.update({password: hashedPassword}, {email});

	resetTokens.delete(token);
}