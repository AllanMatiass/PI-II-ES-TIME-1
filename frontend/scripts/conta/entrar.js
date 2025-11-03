// Autor: Cristian Fava
import { API_URL } from "../utils/config.js";

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
        const json = JSON.stringify({
            email: data.email,
            password: data.senha
        });

        // Efetua a requisição de login e aguarda a resposta
        const res = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            credentials: "include",
            
            headers: {
                "Content-Type": "application/json",
            },
            body: json
        });

        // Coropo da resposta
        const body = await res.json();
        console.log('BODY', body);
        // Em caso de erro no servidor, mostra a mensagem.
        if (res.status !== 200) {
            throw new Error(`Não foi possível fazer login. Erros: ${body.errors?.join(", ") || body.error}`);
        }

        // Depois de efetuar login, redireciona para a dashboard
        localStorage.setItem('token', body.token );

        const linkedInstitutions = await fetch(`${API_URL}/api/institution/by-professor/${body.data.id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + body.token
            }
        });

        const linkedJson = await linkedInstitutions.json();

        if (linkedJson.data > 0){        
            window.location.href = "/frontend/pages/conta/GerenciarInst.html"
            return;
        }
        
        window.location.href = "/frontend/pages/conta/painelPrincipal.html"
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
        icone.src = "/frontend/icons/olho-cortado.png";
    } else {
        inputSenha.type = "password";
        icone.src = "/frontend/icons/olho.png";
    }
});