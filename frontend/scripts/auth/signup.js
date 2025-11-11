// Autor: Cristian Fava
import { API_URL } from "../utils/config.js";
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";

const cadForm = document.querySelector("#register-form");

// Coleta a requisição de envio do formulário
cadForm.addEventListener("submit", async (ev) => {
    // Torna o padrão
    ev.preventDefault();

    // Converte os dados do formulário para um objeto
    const formData = new FormData(ev.currentTarget);
    const data = Object.fromEntries(formData);

    try {
        // Passa os dados para JSON
        const json = JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: data.password
        });

        // Efetua a requisição de login e aguarda a resposta
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            body: json,
            headers: {
                "Content-Type": "application/json"
            },
        });

        // Coropo da resposta
        const body = await res.json();
        
        // Em caso de erro no servidor, mostra a mensagem.
        if (res.status != 200) {
            ShowErrorModal("ERRO AO CADASTRAR CONTA!", [body.error]);
        } else {
            // Depois de criar a conta, redireciona para a página de login
            window.location.href = "/frontend/pages/auth/signin.html";
        }

    } catch (err) {
        ShowErrorModal("ERRO AO CADASTRAR CONTA!", [err]);
    }
});