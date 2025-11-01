// Autor: Mateus de Souza Campos

import nodemailer from "nodemailer";
import dotenv from "dotenv";

// código pra carregar variáveis do arquivo .env
dotenv.config();

// Configuração do E-mail remetente (o qual enviará as mensagens)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,            // Servidor SMTP (ex: smtp.gmail.com)
    port: Number(process.env.EMAIL_PORT),    // Porta (no caso: 587)
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,          // E-mail remetente
        pass: process.env.EMAIL_PASS,          // Senha de app (ou senha SMTP)
    },
    tls: {
        rejectUnauthorized: false,
    },
    family: 4, 
} as any);                                     // Linhas 18 a 22 apenas para corrigir erro

// Função que permite o envio do E-mail
export async function enviarEmail(destinatario: string, mensagem: string) {
    try {
        const info = await transporter.sendMail({
            from: `"SistemaNotaDez" <${process.env.EMAIL_USER}>`, // Refere-se ao remetente
            to: destinatario,                                     // Refere-se ao destinatario
            subject: "A respeito de notas",                       // Assunto do E-mail
            text: mensagem,                                       // Texto simples
            html: `<p>${mensagem}</p>`,                           // (Opcional) versão para HTML
        });

        console.log("E-mail enviado com sucesso:", info.messageId);
        return { sucesso: true, id: info.messageId };
    } catch (erro) {
        console.error("Erro ao enviar e-mail:", erro);
        return { sucesso: false, erro};
    }
}
