// Autor: Mateus de Souza Campos

console.log("🟢 Iniciando execução...");

import { enviarEmail } from "./services/emailService";

async function main() {
    const email = "mdecampos2000@gmail.com"
    const mensagem = "Teste do envio de email!";

    const resultado = await enviarEmail(email,mensagem);
    console.log(resultado);
}

main();
