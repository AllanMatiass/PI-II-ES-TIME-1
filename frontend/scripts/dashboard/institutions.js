// Autor: Murilo Rigoni

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadInstitutionList } from '/frontend/components/institution-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var institutionList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

$('#institution-search-input').on('keyup', (ev) => {
	filter = ev.currentTarget.value;
	ShowInstitutions();
});

$('#open-institution-modal-btn').on('click', () => {
	$('#institution-form')[0].reset();
	$('#institution-form').removeAttr('data-institution-id');
	$('#institution-modal-title').html('CRIAR INSTITUIÇÃO');

	const modal = new bootstrap.Modal($('#institution-modal')[0]);
	modal.show();
});

$('#save-institution-btn').on('click', async () => {
	const institutionId = $('#institution-form').attr('data-institution-id');
	const formdata = new FormData($('#institution-form')[0]);

	if (!institutionId) {
		await CreateInstitution(formdata);
	} else {
		await AlterInstitution(institutionId, formdata);
	}

	const modal = bootstrap.Modal.getInstance($('#institution-modal')[0]);
	modal.hide();
});

$('#delete-institution-btn').on('click', async () => {
	const institutionId = $('#delete-institution-modal').attr('data-institution-id');
	await DeleteInstitution(institutionId);
});
// Abre o modal de criação de instituição

async function CreateInstitution(institutionData) {
	try {
		const res = await fetch(`${API_URL}/api/institution`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify(Object.fromEntries(institutionData)),
		});

		const body = await res.json();

		if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (res.status != 200) {
			return ShowErrorModal('ERRO AO CRIAR INSTITUIÇÃO', [body.error]);
		}

		institutionList.push(body.data);
		ShowInstitutions();
	} catch (err) {
		ShowErrorModal('ERRO AO CRIAR INSTITUIÇÃO', [err.message]);
	}
}

async function AlterInstitution(id, data) {
	try {
		const res = await fetch(`${API_URL}/api/institution/${id}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify(Object.fromEntries(data)),
		});

		const body = await res.json();

		if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}
		
		if (res.status != 200) {
			return ShowErrorModal('ERRO AO ALTERAR INSTITUIÇÃO', [body.error]);
		}

		await FetchInstitutions();
	} catch (err) {
		ShowErrorModal('ERRO AO ALTERAR INSTITUIÇÃO', [err.message]);
	}
}

async function DeleteInstitution(id) {
	try {
		const res = await fetch(`${API_URL}/api/institution/${id}`, {
			method: 'DELETE',
			headers: GetAuthHeaders()
		});

		const body = await res.json();

		if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (res.status != 200) {
			return ShowErrorModal('ERRO AO EXCLUIR INSTITUIÇÃO', [body.error]);
		}

		await FetchInstitutions();
	} catch (err) {
		ShowErrorModal('ERRO AO EXCLUIR INSTITUIÇÃO', [err.message]);
	}

	const modal = bootstrap.Modal.getInstance($('#delete-institution-modal')[0]);
	modal.hide();
}

async function FetchInstitutions() {
	try {
		const res = await fetch(`${API_URL}/api/institution/all`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}
		if (res.status != 200) {
			return ShowErrorModal('ERRO AO CARREGAR INSTITUIÇÕES', [body.message]);
		}

		let dataSet = body.data.filter((data) =>
			data.professors.find((prof) => prof.id == localStorage.getItem('userId'))
		);

		institutionList = dataSet.map((data) => data.institution);
		ShowInstitutions();
	} catch (err) {
		ShowErrorModal('ERRO AO CARREGAR INSTITUIÇÕES', [err.message]);
	}
}

function ShowInstitutions() {
	$('#institution-table').find('tbody').html('');

	const filteredList = institutionList.filter((inst) =>
		inst.name.toLowerCase().startsWith(filter.toLowerCase())
	);
	LoadInstitutionList(filteredList, $('#institution-table'));
}

FetchInstitutions();
ShowInstitutions();