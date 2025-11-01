// Autor: Mateus de Souza Campos

console.log("🟢 Iniciando execução...");

import { sendEmail } from "./services/emailService";

async function main() {
    const email = "mdecampos2000@gmail.com"
    const mensagem = "Teste do envio de email!";

    const resultado = await sendEmail(email,mensagem, 'Notas');
    console.log(resultado);
}

main();
