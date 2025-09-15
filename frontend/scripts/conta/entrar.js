// Autor: Cristian Fava
import { API_URL } from "../utils/config";

const loginForm = document.querySelector("#loginForm");
const mostrarSenhaBtn = document.querySelector("#mostrarSenha");

// Coleta a requisição de envio do formulário
loginForm.addEventListener("submit", async (ev) => {
    
    // Torna o padrão
    ev.preventDefault();

    // Converte os dados do formulário para um objeto
    const formData = new FormData(ev.currentTarget);
    const data = Object.fromEntries(formData);

    try {
        // Passa os dados para JSON
        const json = JSON.stringify(data);

        // Efetua a requisição de login e aguarda a resposta
        const res = await fetch(`${API_URL}/conta/entrar`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: json
        });

        // Coropo da resposta
        const body = await res.json();
        
        // Em caso de erro no servidor, mostra a mensagem.
        if (res.status != 200) {
            throw new Error(`Não foi possível fazer login. Erros: ${body.erros.join(", ")}`);
        }

        // Depois de efetuar login, redireciona para a dashboard
        window.location.href = "/frontend/pages/painel/home.html"
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