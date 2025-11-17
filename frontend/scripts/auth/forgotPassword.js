// Autor: Allan Giovanni
import { ShowErrorModal } from "../../components/errors-modal/modal.js";
import { API_URL } from "../utils/config.js";

const form = document.querySelector('#forgotForm');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const formData = new FormData(ev.currentTarget);
	const data = Object.fromEntries(formData);

    spinner.classList.remove('d-none');
    submitBtn.disabled = true;


    try {
            // Passa os dados para JSON
            const json = JSON.stringify({
                email: data.email.trim()
            });
    
            // Efetua a requisição de login e aguarda a resposta
            const res = await fetch(`${API_URL}/api/forgot-password`, {
                method: 'POST',
                credentials: 'include',
                body: json,
                
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            // Coropo da resposta
            const body = await res.json();
    
            // Em caso de erro no servidor, mostra a mensagem.
            if (res.status !== 200) {
                return ShowErrorModal('ERRO AO ENVIAR CÓDIGO!', [body.error]);
            }
            
            localStorage.setItem("recoverToken", body.data.token)
            window.location.href = '/frontend/pages/auth/recoverPassword.html';
        } catch (err) {
            ShowErrorModal("ERRO AO ENVIAR CÓDIGO!", [err]);
        } finally {
        spinner.classList.add('d-none');
        submitBtn.disabled = false;
    }
});