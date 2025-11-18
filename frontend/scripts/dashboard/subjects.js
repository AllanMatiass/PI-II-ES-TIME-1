// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { LoadSubjectsList } from '/frontend/components/subject-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var subjectsList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

// Parâmetros da URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('courseId');

// Verifica se o ID da matéria está na URL
if (!courseId) {
	window.location.href = '/frontend/pages/dashboard/institutions.html';
}

// Evento barra de busca
$('#subject-search-input').on('keyup', (ev) => {
	filter = ev.currentTarget.value;
	ShowSubjects();
});

// Evento abrir modal de cadastro de matérias
$('#open-subject-modal-btn').on('click', () => {
	// Limpa o formulário
	$('#subject-form')[0].reset();
	$('#subject-form').removeAttr('data-subject-id');
	$('#subject-modal-title').html('CRIAR DISCIPLINA');

	// Abre o modal
	const modal = new bootstrap.Modal($('#subject-modal')[0]);
	modal.show();
});

// Evento botão de salvar matéria
$('#save-subject-btn').on('click', async () => {
	const subjectId = $('#subject-form').attr('data-subject-id');
	const formdata = new FormData($('#subject-form')[0]);

	if (!subjectId) {
		await CreateSubject(formdata);
	} else {
		await AlterSubject(subjectId, formdata);
	}

	// Fecha o modal
	const modal = bootstrap.Modal.getInstance($('#subject-modal')[0]);
	modal.hide();
});

// Evento botão de excluir matéria
$('#delete-subject-btn').on('click', async () => {
	const subjectId = $('#delete-subject-modal').attr('data-subject-id');
	await DeleteSubject(subjectId);
});

// Eventos inputs de data
$('#subject-start-date').on('change', AlterEndDate);
$('#subject-period-nb').on('change', AlterEndDate);

// Alterção da data final
function AlterEndDate() {
	const start = new Date($('#subject-start-date').val());
	const period = parseInt($('#subject-period-nb').val(), 10);

	if (isNaN(start.getTime()) || isNaN(period)) {
		console.warn('Data inicial ou período inválido.');
		return;
	}

	// Cada período = 6 meses
	start.setMonth(start.getMonth() + 6);

	const formatted = start.toISOString().split('T')[0];
	$('#subject-end-date').val(formatted);
}

// Chamadas da API

// Cadastrar matéria
async function CreateSubject(data) {
	try {
		// Requisição de cadastro
		const res = await fetch(`${API_URL}/api/subject`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				course_id: courseId,
				name: data.get('subject-name'),
				code: data.get('subject-code'),
				acronym: data.get('subject-acronym'),
				period: parseInt(data.get('subject-period'), 10),
				start_date: data.get('subject-start'),
				end_date: data.get('subject-end'),
			}),
		});

		const body = await res.json();

		// Veririfica se o token é válido
		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CRIAR MATÉRIA', [body.error]);
		}

		await FetchSubjects();
	} catch (err) {
		ShowErrorModal('ERRO AO CRIAR MATÉRIA', [err.message]);
	}
}

// Alterar matéria
async function AlterSubject(id, formdata) {
	try {
		// Requisição de alteração
		const res = await fetch(`${API_URL}/api/subject/${id}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				course_id: courseId,
				name: formdata.get('subject-name'),
				code: formdata.get('subject-code'),
				acronym: formdata.get('subject-acronym'),
				period: Number(formdata.get('subject-period')),
				start_date: formdata.get('subject-start'),
				end_date: formdata.get('subject-end'),
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO ALTERAR MATÉRIA', [body.error]);
		}

		await FetchSubjects();
	} catch (err) {
		ShowErrorModal('ERRO AO ALTERAR MATÉRIA', [err.message]);
	}
}

// Excluir matéria
async function DeleteSubject(id) {
	try {
		// Requisição de exclusão
		const res = await fetch(`${API_URL}/api/subject/${id}`, {
			method: 'DELETE',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO EXCLUIR MATÉRIA', [body.error]);
		}

		await FetchSubjects();
	} catch (err) {
		ShowErrorModal('ERRO AO EXCLUIR MATÉRIA', [err.message]);
	}

	const modal = bootstrap.Modal.getInstance($('#delete-subject-modal')[0]);
	modal.hide();
}

// Buscar matérias
async function FetchSubjects() {
	try {
		// Requisição de busca
		const res = await fetch(`${API_URL}/api/course/${courseId}/subjects`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CARREGAR MATÉRIAS', [body.message]);
		}

		subjectsList = body.data;
		ShowSubjects();
	} catch (err) {
		ShowErrorModal('ERRO AO CARREGAR MATÉRIAS', [err.message]);
	}
}

// Exibe as matérias na tela
function ShowSubjects() {
	$('#subject-table').find('tbody').html('');

	const filteredList = subjectsList.filter((c) =>
		c.name.toLowerCase().startsWith(filter.toLowerCase())
	);
	LoadSubjectsList(filteredList, $('#subject-table'));
}

FetchSubjects();