// Autor: Cristian Fava
import { API_URL } from "../utils/config.js";

const cadForm = document.querySelector("#cadForm");

const mostrarSenhaBtn = document.querySelector("#mostrarSenha");
const mostrarConfirmaSenhaBtn = document.querySelector("#mostrarConfirmaSenha");

// Coleta a requisição de envio do formulário
cadForm.addEventListener("submit", async (ev) => {
    // Torna o padrão
    ev.preventDefault();

    // Converte os dados do formulário para um objeto
    const formData = new FormData(ev.currentTarget);
    const data = Object.fromEntries(formData);

    if (data.senha != data.confirmaSenha) {
        alert("As senhas fornecidas são diferentes!");
        return;
    }

    try {
        // Passa os dados para JSON
        const json = JSON.stringify({
            name: data.nome,
            phone: data.telefone,
            email: data.email,
            password: data.senha,
            confirmPassword: data.confirmaSenha
        });

        // Efetua a requisição de login e aguarda a resposta
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: json
        });

        // Coropo da resposta
        const body = await res.json();
        
        // Em caso de erro no servidor, mostra a mensagem.
        if (res.status != 200) {
            throw new errors(`Não foi possível cadastrar a conta. Erros: ${body.errors.join(", ")}`);
        }

        // Depois de criar a conta, redireciona para a página de login
        window.location.href = "/frontend/pages/conta/entrar.html";
    } catch (err) {
        alert(err.message);
    }
});

// Click do botão de mostrar e esconder senha
mostrarSenhaBtn.addEventListener("click", () => {
    const inputSenha = document.querySelector("#senhaTxt");
    const icone = document.querySelector("#iconeSenha");
    
    // Esconde e mostra a senha no input
    if (inputSenha.type == "password") {
        inputSenha.type = "text";
        icone.src = "../icons/olho-cortado.png";
    } else {
        inputSenha.type = "password";
        icone.src = "../icons/olho.png";
    }
});

// Click do botão de mostrar e esconder a confirmação da senha
mostrarConfirmaSenhaBtn.addEventListener("click", () => {
    const inputSenha = document.querySelector("#confirmaSenhaTxt");
    const icone = document.querySelector("#iconeConfirmaSenha");
    
    // Esconde e mostra a senha no input
    if (inputSenha.type == "password") {
        inputSenha.type = "text";
        icone.src = "../icons/olho-cortado.png";
    } else {
        inputSenha.type = "password";
        icone.src = "../icons/olho.png";
    }
});