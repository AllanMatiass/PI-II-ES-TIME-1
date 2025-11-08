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
			password: data.senha,
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
            ShowErrorModal("ERRO AO EFETUAR LOGIN!", body.errors);
		}

		// Depois de efetuar login, redireciona para a dashboard
		localStorage.setItem('token', body.token);
		localStorage.setItem('userId', body.data.id);

		// Coleta as instituicoes linkadas ao professor
		const linkedInstitutions = await fetch(
			`${API_URL}/api/institution/by-professor/${body.data.id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + body.token,
				},
			}
		);

		const linkedJson = await linkedInstitutions.json();

		if (linkedJson.data.length === 0) {
			window.location.href = '/frontend/pages/conta/gerenciarInst.html';
			return;
		}

		window.location.href = '/frontend/pages/conta/dashboard.html';
    } catch (err) {
        ShowErrorModal("ERRO AO EFETUAR LOGIN!", [err]);
    }
});
