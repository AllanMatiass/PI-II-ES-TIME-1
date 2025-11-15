// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadClassesList } from '/frontend/components/class-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var classsList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
    window.location.href = '/frontend/pages/auth/signin.html';
}

// Verifica se o ID da CLASSE está na URL
const params = new URLSearchParams(window.location.search);
const subjectId = params.get('subjectId');

if (!subjectId) {
    window.location.href = '/frontend/pages/dashboard/institutions.html';
}

$('#class-search-input').on('keyup', (ev) => {
    filter = ev.currentTarget.value;
    ShowClasses();
});

$('#open-class-modal-btn').on('click', () => {
    $('#class-form')[0].reset();
    $('#class-form').removeAttr('data-class-id');
    $('#class-modal-title').html('CRIAR TURMA');

    const modal = new bootstrap.Modal($('#class-modal')[0]);
    modal.show();
});

$('#return-btn').on('click', () => {
    window.location.href = `/frontend/pages/dashboard/subjects.html?subjectId=${subjectId}`;
});

$('#save-class-btn').on('click', async () => {
    const classId = $('#class-form').attr('data-class-id');
    const formdata = new FormData($('#class-form')[0]);

    if (!classId) {
        await CreateClass(formdata);
    } else {
        await AlterClass(classId, formdata);
    }

    const modal = bootstrap.Modal.getInstance($('#class-modal')[0]);
    modal.hide();
});

$('#delete-class-btn').on('click', async () => {
    const classId = $('#delete-class-modal').attr('data-class-id');
    await DeleteClass(classId);
});

async function CreateClass(formData) {
	try {
		const res = await fetch(`${API_URL}/api/class`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				subject_id: subjectId,
				name: formData.get('class-name'),
				classroom: formData.get('classroom'),
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CRIAR CLASSE', [body.error]);
		}

		classsList.push(body.data);
		ShowClasses();
	} catch (err) {
		ShowErrorModal('ERRO AO CRIAR CLASSE', [err.message]);
	}
}

async function AlterClass(id, formData) {
	try {
		const res = await fetch(`${API_URL}/api/class/${id}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				name: formData.get('class-name'),
				classroom: formData.get('classroom'),
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO ALTERAR CLASSE', [body.error]);
		}

		await FetchClasses();
	} catch (err) {
		ShowErrorModal('ERRO AO ALTERAR CLASSE', [err.message]);
	}
}

async function DeleteClass(id) {
	try {
		const res = await fetch(`${API_URL}/api/class/${id}`, {
			method: 'DELETE',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO EXCLUIR CLASSE', [body.error]);
		}

		await FetchClasses();
	} catch (err) {
		ShowErrorModal('ERRO AO EXCLUIR CLASSE', [err.message]);
	}

	const modal = bootstrap.Modal.getInstance($('#delete-class-modal')[0]);
	modal.hide();
}

async function FetchClasses() {
	try {
		const res = await fetch(`${API_URL}/api/classes/by-subject/${subjectId}`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (!res.ok) {
			return ShowErrorModal('ERRO AO CARREGAR AS TURMAS', [body.message]);
		}

		classsList = body.data;
		ShowClasses();
	} catch (err) {
		ShowErrorModal('ERRO AO CARREGAR AS TURMAS', [err.message]);
	}
}

function ShowClasses() {
    $('#class-table').find('tbody').html('');

    const filteredList = classsList.filter((c) =>
        c.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    LoadClassesList(filteredList, $('#class-table'));
}

FetchClasses();
ShowClasses();