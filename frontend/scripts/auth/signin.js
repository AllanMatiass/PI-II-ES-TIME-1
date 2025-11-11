// Autor: Cristian Fava
import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';

const loginForm = document.querySelector('#login-form');

// Coleta a requisição de envio do formulário
loginForm.addEventListener('submit', async (ev) => {
	// Torna o padrão
	ev.preventDefault();

	// Converte os dados do formulário para um objeto
	const formData = new FormData(ev.currentTarget);
	const data = Object.fromEntries(formData);

	try {
		// Passa os dados para JSON
		const json = JSON.stringify({
			email: data.email,
			password: data.password,
		});

		// Efetua a requisição de login e aguarda a resposta
		const res = await fetch(`${API_URL}/api/login`, {
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
					return ShowErrorModal('ERRO AO EFETUAR LOGIN!', [body.error]);
				}

				// Depois de efetuar login, redireciona para a dashboard
				localStorage.setItem('token', body.token);
				localStorage.setItem('userId', body.data.id);

				window.location.href = '/frontend/pages/dashboard/institutions.html';
    } catch (err) {
        ShowErrorModal("ERRO AO EFETUAR LOGIN!", [err]);
    }
});
