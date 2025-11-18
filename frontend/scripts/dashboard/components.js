// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { LoadComponentList } from '/frontend/components/component-table/row.js';

// Lista de componentes e filtro
let componentsList = [];
let filter = '';

// Parâmetros da URL
const params = new URLSearchParams(window.location.search);
const subjectId = params.get('subjectId');

// ID da matéria
if (!subjectId) {
	window.location.href = '/frontend/pages/dashboard/institutions.html';
}

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

// Evento da barra de busca
$('#component-search-input').on('keyup', (e) => {
	filter = e.currentTarget.value;
	ShowComponents();
});

// Abrir modal e carregar fórmula
$('#open-formula-modal-btn').on('click', async () => {
	try {

		// Pesquisa a formula ja existente
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/final-formula`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		// Verifica se o token é válido
		if (!isValidToken(res)) {
			return window.location.href = '/frontend/pages/auth/signin.html';
		}

		let body = await res.json();

		if (!res.ok) {
			return ShowErrorModal('Erro ao carregar formula!', [body.error]);
		}

		$('#final-formula-input').val(body.formula_text);

		// Abre o modal de formula
		const modal = new bootstrap.Modal($('#formula-modal')[0]);
		modal.show();
	} catch (err) {
		ShowErrorModal('Erro ao carregar fórmula', [err.message]);
	}
});

// Evento salvar fórmula
$('#save-formula-btn').on('click', async () => {
	const formula = $('#final-formula-input').val();

	if (!formula || formula.trim() === '') {
		return ShowErrorModal('Fórmula inválida', ['Digite uma fórmula válida.']);
	}

	SaveFormula(formula);
});

// Evento abrir modal criação
$('#open-component-modal-btn').on('click', () => {
	// Limpa o modal
	$('#component-form')[0].reset();
	$('#component-acronym').attr('disabled', false);
	$('#component-form').removeAttr('data-component-id');
	$('#component-modal-title').html('CRIAR COMPONENTE');

	new bootstrap.Modal($('#component-modal')[0]).show();
});

// Evento salvar
$('#save-component-btn').on('click', async () => {
	const componentId = $('#component-form').attr('data-component-id');
	const fd = Object.fromEntries(new FormData($('#component-form')[0]));

	if (!componentId) {
		await CreateComponent(fd);
	} else {
		await AlterComponent(componentId, fd);
	}

	bootstrap.Modal.getInstance($('#component-modal')[0]).hide();
});

// Evento excluir
$('#delete-component-btn').on('click', async () => {
	const id = $('#delete-component-modal').attr('data-component-id');
	await DeleteComponent(id);
});

// FUNÇÕES API

// Salva a formula
async function SaveFormula(formula) {
	try {
		// Salva a formula
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/final-formula`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({ formula_text: formula }),
		});

		const body = await res.json();

		// Verifica o token
		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
		}

		if (!res.ok) {
			ShowErrorModal('Erro ao salvar fórmula', [
				body.error ?? 'Erro desconhecido',
			]);
		}

		// Fecha o modal
		const modal = bootstrap.Modal.getInstance($('#formula-modal')[0]);
		modal.hide();
	} catch (err) {
		ShowErrorModal('Erro ao salvar fórmula', [err.message]);
	}
}

// Busca os componentes
async function FetchComponents() {
	try {
		// Requisição de busca
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/components`, {
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			return (window.location.href = '/frontend/pages/auth/signin.html');
		}

		if (!res.ok) {
			return ShowErrorModal('Erro ao buscar componentes', [body.error]);
		}

		componentsList = body.data;
		ShowComponents();
	} catch (err) {
		ShowErrorModal('Erro ao buscar componentes', [err.message]);
	}
}

// Cadastrar um componente
async function CreateComponent(data) {
	try {
		// Requisição de cadastro
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/component`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				name: data.name,
				formula_acronym: data.formula_acronym,
				description: data.description,
				subject_id: subjectId,
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			return (window.location.href = '/frontend/pages/auth/signin.html');
		}

		if (!res.ok) {
			return ShowErrorModal('Erro ao criar componente', [body.error]);
		}

        await FetchComponents();
	} catch (err) {
		ShowErrorModal('Erro ao criar componente', [err.message]);
	}
}

// Altera um componente
async function AlterComponent(id, data) {
	try {
		// Requisiçao de alteração
		const res = await fetch(`${API_URL}/api/component/${id}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				name: data.name,
				formula_acronym: data.formula_acronym,
				description: data.description,
				subject_id: subjectId,
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			return (window.location.href = '/frontend/pages/auth/signin.html');
		}

		if (!res.ok) {
			return ShowErrorModal('Erro ao alterar componente', [body.error]);
		}

		await FetchComponents();
	} catch (err) {
		ShowErrorModal('Erro ao alterar componente', [err.message]);
	}
}

// Requisição de exclusão
async function DeleteComponent(id) {
	try {
		const res = await fetch(`${API_URL}/api/component/${id}`, {
			method: 'DELETE',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res))
			return (window.location.href = '/frontend/pages/auth/signin.html');

		if (!res.ok)
			return ShowErrorModal('Erro ao excluir componente', [body.error]);

		await FetchComponents();

		bootstrap.Modal.getInstance($('#delete-component-modal')[0]).hide();
	} catch (err) {
		ShowErrorModal('Erro ao excluir componente', [err.message]);
	}
}

// Mostrar tabela
function ShowComponents() {
	$('#components-table').find('tbody').html('');

	const filtered = componentsList.filter((c) =>
		c.name.toLowerCase().startsWith(filter.toLowerCase())
	);

	LoadComponentList(filtered, $('#components-table'));
}

// Execução inicial
FetchComponents();