// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { LoadStudentsList } from '/frontend/components/students-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

// Lista de notas, estudantes e filtro
var studentsList = [];
var gradesList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

// Parâmetros da URL
const params = new URLSearchParams(window.location.search);
const classId = params.get('classId');
const subjectId = params.get('subjectId');

// Verifica se os IDs da matéria e da classe estão na URL
if (!classId || !subjectId) {
	window.location.href = '/frontend/pages/dashboard/institutions.html';
}

// Evento barra de busca
$('#student-search-input').on('keyup', (ev) => {
	filter = ev.currentTarget.value;
	ShowStudents();
});

// Evento botão abrir modal de cadastro
$('#open-student-modal-btn').on('click', () => {
	$('#student-form')[0].reset();
	$('#student-form').removeAttr('data-student-id');
	$('#student-modal-title').html('CASDASTRAR ALUNO');
	$('#student-registration-id-txt').attr('disabled', false);

	const modal = new bootstrap.Modal($('#student-modal')[0]);
	modal.show();
});

// Evento botão salvar estudante
$('#save-student-btn').on('click', async () => {
	const studentId = $('#student-form').attr('data-student-id');
	const formdata = new FormData($('#student-form')[0]);

	if (!studentId) {
		await CreateStudent(formdata);
	} else {
		await AlterStudent(studentId, formdata);
	}

	const modal = bootstrap.Modal.getInstance($('#student-modal')[0]);
	modal.hide();
});

// Evento botão excluir estudante
$('#delete-student-btn').on('click', async () => {
	const studentId = $('#delete-student-modal').attr('data-student-id');
	await DeleteStudent(studentId);
});

// Evento botão de importar CSV
$('#import-csv-btn').on('click', async () => {
	const fileInput = document.getElementById('csv-file'); // Arquivo CSV

	if (!fileInput.files.length) {
		return ShowErrorModal('ERRO AO IMPORTAR CSV', [
			'Nenhum arquivo selecionado.',
		]);
	}

	await ImportCSV(fileInput);

	// Fecha modal
	const modal = bootstrap.Modal.getInstance($('#import-csv-modal')[0]);
	modal.hide();

	// Atualiza lista de alunos
	await FetchStudents();
});

// Evento botão de exportar CSV
$('#export-csv-btn').on('click', async () => {
	try {
		await ExportCSV();

		// Fecha modal
		const modal = bootstrap.Modal.getInstance($('#export-csv-modal')[0]);
		modal.hide();
	} catch (err) {
		ShowErrorModal('ERRO AO EXPORTAR CSV', [err.message]);
	}
});

// Chamadas da API

// Importar CSV
async function ImportCSV(file) {
	try {
		const formData = new FormData();
		formData.append('file', file.files[0]);

		// Requisição de importação
		const res = await fetch(`${API_URL}/api/class/${classId}/import`, {
			method: 'POST',
			headers: GetAuthHeaders(false),
			body: formData,
		});

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		const body = await res.json();

		if (!res.ok) {
			return ShowErrorModal('ERRO AO IMPORTAR CSV', [body.error]);
		}
	} catch (err) {
		ShowErrorModal('ERRO AO IMPORTAR CSV', [err.message]);
	}
}

// Exportar CSV
async function ExportCSV() {
	// Requisição de exportação
	const res = await fetch(
		`${API_URL}/api/class/${classId}/subject/${subjectId}/export`,
		{
			method: 'GET',
			headers: GetAuthHeaders(false),
		}
	);

	if (!isValidToken(res)) {
		window.location.href = '/frontend/pages/auth/signin.html';
		return;
	}

	if (!res.ok) {
		const body = await res.json();
		return ShowErrorModal('ERRO AO EXPORTAR CSV', [body.error]);
	}

	// Lê CSV como blob
	const blob = await res.blob();

	// Pega nome do arquivo do header
	const disposition = res.headers.get('Content-Disposition');
	let fileName = 'export.csv';

	if (disposition && disposition.includes('filename=')) {
		fileName = disposition.split('filename=')[1].replace(/"/g, '');
	}

	// Baixa arquivo
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.URL.revokeObjectURL(url);
}

// Cadastro de estudantes
async function CreateStudent(studentData) {
	try {
		// Requisição de cadastro
		const res = await fetch(`${API_URL}/api/student/${classId}`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify(Object.fromEntries(studentData)),
		});

		const body = await res.json();

		// Verifica se o token é válido
		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CRIAR ESTUDANTE', [body.error]);
		}

		await FetchStudents();
	} catch (err) {
		ShowErrorModal('ERRO AO CRIAR ESTUDANTE', [err.message]);
	}
}

// Alteração de estudante
async function AlterStudent(id, data) {
	try {
		// Requisição de alteração
		const res = await fetch(`${API_URL}/api/student/${id}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify(Object.fromEntries(data)),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO ALTERAR ESTUDANTE', [body.error]);
		}

		await FetchStudents();
	} catch (err) {
		ShowErrorModal('ERRO AO ALTERAR ESTUDANTE', [err.message]);
	}
}

// Exclusão de estudante
async function DeleteStudent(registration_id) {
	try {
		// Requisição de exclusão
		const res = await fetch(
			`${API_URL}/api/student/${classId}/${registration_id}`,
			{
				method: 'DELETE',
				headers: GetAuthHeaders(),
			}
		);

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO EXCLUIR ESTUDANTE', [body.error]);
		}

		await FetchStudents();
	} catch (err) {
		ShowErrorModal('ERRO AO EXCLUIR ESTUDANTE', [err.message]);
	}

	const modal = bootstrap.Modal.getInstance($('#delete-student-modal')[0]);
	modal.hide();
}

// Buscar estudantes
async function FetchStudents() {
    try {
        // Requisição de busca
		const res = await fetch(`${API_URL}/api/students/${classId}`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CARREGAR OS ALUNOS', [body.error]);
		}

		studentsList = body.data;
		ShowStudents();
	} catch (err) {
		ShowErrorModal('ERRO AO CARREGAR OS ALUNOS', [err.message]);
	}
}

// Buscar notas dos estudantes
async function FetchStudentsGrades() {
    try {
        // Requisição de busca de notas
		const res = await fetch(`${API_URL}/api/class/${classId}/subject/${subjectId}/grades`,
			{
				method: 'GET',
				headers: GetAuthHeaders(),
			}
		);

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CARREGAR AS NOTAS', [body.error]);
		}

		gradesList = body.data;
		await FetchStudents();
	} catch (err) {
		ShowErrorModal('ERRO AO CARREGAR AS NOTAS', [err.message]);
	}
}

// Exibe os estudantes na tela
function ShowStudents() {
	$('#students-table').find('tbody').html('');

	const filteredList = studentsList.filter((inst) =>
		inst.name.toLowerCase().startsWith(filter.toLowerCase())
	);
	LoadStudentsList(filteredList, gradesList, $('#students-table'));
}

FetchStudentsGrades();