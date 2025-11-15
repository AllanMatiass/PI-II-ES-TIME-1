// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { LoadComponentList } from '/frontend/components/component-table/row.js';

let componentsList = [];
let filter = '';

const params = new URLSearchParams(window.location.search);
const subjectId = params.get('subjectId');

if (!subjectId) {
	window.location.href = '/frontend/pages/dashboard/institutions.html';
}

if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

// Buscar na tabela
$('#component-search-input').on('keyup', (e) => {
	filter = e.currentTarget.value;
	ShowComponents();
});

// Abrir modal e carregar fórmula
$('#open-formula-modal-btn').on('click', async () => {
	try {
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/final-formula`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		if (!isValidToken(res)) {
			return (window.location.href = '/frontend/pages/auth/signin.html');
		}

		let body = await res.json();

		if (!res.ok) {
			return ShowErrorModal('Erro ao carregar formula!', [body.error]);
		}

		$('#final-formula-input').val(body.formula_text);

		const modal = new bootstrap.Modal($('#formula-modal')[0]);
		modal.show();
	} catch (err) {
		ShowErrorModal('Erro ao carregar fórmula', [err.message]);
	}
});

// Salvar fórmula
$('#save-formula-btn').on('click', async () => {
	const formula = $('#final-formula-input').val();

	if (!formula || formula.trim() === '') {
		return ShowErrorModal('Fórmula inválida', ['Digite uma fórmula válida.']);
	}

	SaveFormula(formula);
});

// Abrir modal criar
$('#open-component-modal-btn').on('click', () => {
	$('#component-form')[0].reset();
	$('#component-form').removeAttr('data-component-id');
	$('#component-modal-title').html('CRIAR COMPONENTE');

	new bootstrap.Modal($('#component-modal')[0]).show();
});

// Salvar criar/editar
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

// Excluir
$('#delete-component-btn').on('click', async () => {
	const id = $('#delete-component-modal').attr('data-component-id');
	await DeleteComponent(id);
});

// FUNÇÕES API
async function SaveFormula(formula) {
	try {
		const res = await fetch(`${API_URL}/api/subject/${subjectId}/final-formula`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({ formula_text: formula }),
		});

		const body = await res.json();

        if (!isValidToken(res)) {
            window.location.href = '/frontend/pages/auth/signin.html';
        }

		if (!res.ok) {
			ShowErrorModal('Erro ao salvar fórmula', [
				body.error ?? 'Erro desconhecido',
			]);
		}

		const modal = bootstrap.Modal.getInstance($('#formula-modal')[0]);
		modal.hide();
	} catch (err) {
		ShowErrorModal('Erro ao salvar fórmula', [err.message]);
	}
}

async function FetchComponents() {
	try {
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

		console.log(body);

		componentsList = body.data;
		ShowComponents();
	} catch (err) {
		ShowErrorModal('Erro ao buscar componentes', [err.message]);
	}
}

async function CreateComponent(data) {
	try {
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

		componentsList.push(body.data);
		ShowComponents();
	} catch (err) {
		ShowErrorModal('Erro ao criar componente', [err.message]);
	}
}

async function AlterComponent(id, data) {
	try {
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
	const filtered = componentsList.filter((c) =>
		c.name.toLowerCase().startsWith(filter.toLowerCase())
	);

	$('#components-table tbody').html('');
	LoadComponentList(filtered, $('#components-table'));
}

// Execução inicial
FetchComponents();
ShowComponents();
