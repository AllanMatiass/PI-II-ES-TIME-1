console.log(" Iniciando teste...");

import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function testarEmail() {
  console.log("🔍 Testando conexão SMTP...");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Conexão SMTP bem-sucedida!");
  } catch (err) {
    console.error("❌ Erro ao conectar:", err);
  }
}

testarEmail();
