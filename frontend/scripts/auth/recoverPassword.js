// Autor: Allan Giovanni
import { ShowErrorModal } from "../../components/errors-modal/modal.js"; 
import { API_URL } from "../utils/config.js";

const code = localStorage.getItem('recoverToken');
const form = document.querySelector('#recoverForm');
const codeInput = document.querySelector('#code');

codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    

    const formData = new FormData(ev.currentTarget);
        const data = Object.fromEntries(formData);
        
        if (data.code != code){
            console.error('codigo invalido');
            return ShowErrorModal('Código inválido!');
        }

        try {
            if (data.senha.trim() !== data.confirmaSenha.trim()){
                return ShowErrorModal('As senhas devem ser iguais!');
            }

            // Passa os dados para JSON
            const json = JSON.stringify({
                token: Number(code),
                newPassword: data.senha.trim()
            });
        
            // Efetua a requisição de login e aguarda a resposta
            const res = await fetch(`${API_URL}/api/reset-password`, {
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
                return ShowErrorModal('ERRO AO ATRIBUIR NOVA SENHA!', [body.error]);
            }
                
            localStorage.removeItem("recoverToken");
            window.location.href = '/frontend/pages/auth/signin.html';
        } catch (err) {
            ShowErrorModal("ERRO AO ATRIBUIR NOVA SENHA!", [err]);
        }
})