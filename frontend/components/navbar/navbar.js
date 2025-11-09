// Autor: Cristian Fava

import { GetAuthHeaders } from "/frontend/scripts/utils/getAuthHeaders.js";
import { API_URL } from "/frontend/scripts/utils/config.js";
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";

$.get('/frontend/components/navbar/navbar.html', (html) => {
	const $navbar = $(html);

	$(document.body).prepend($navbar);

	$navbar.find('#open-profile-btn')
		.on('click', async () => {
			const profile = await fetchProfileInfo();
			if (!profile) return;

			$navbar.find('#nomeTxt').val(profile.data.name);
			$navbar.find('#emailTxt').val(profile.data.email);
			$navbar.find('#telefoneTxt').val(profile.data.phone);

			const modal = new bootstrap.Modal($navbar.find('#profile-modal')[0]);
			modal.show();
		});
	
	// Botões do modal de perfil
	$navbar.find('#save-changes-btn')
		.on('click', async () => {
			const formdata = new FormData($navbar.find('#profile-form')[0]);

			await UpdateProfileInfo(formdata);

			const modal = bootstrap.Modal.getInstance($navbar.find('#profile-modal')[0]);
			modal.hide();
		});
	
	$navbar.find('#logout-btn')
		.on('click', () => {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('userId');
			window.location.href = '/frontend/pages/auth/signin.html';
		});
});

async function UpdateProfileInfo(updatedInfo) {
	const professorId = window.localStorage.getItem('userId');

	try {
		const res = await fetch(`${API_URL}/api/professor/${professorId}`, {
			method: 'PUT',
			headers: GetAuthHeaders(),
			body: JSON.stringify(Object.fromEntries(updatedInfo)),
		});

		const body = await res.json();

		if (res.status != 200) {
			return ShowErrorModal("ERRO AO ATUALIZAR O PERFIL", [body.error]);
		}
	} catch (err) {
		ShowErrorModal("ERRO AO ATUALIZAR O PERFIL", [err]);
	}
}

async function fetchProfileInfo() {
	try {
		const res = await fetch(`${API_URL}/api/profile`, {
			method: 'GET',
			headers: GetAuthHeaders(),
		});

		const body = await res.json();

		if (res.status != 200) {
			return ShowErrorModal(body.json);
		}

		return body;
	} catch (err) {
		ShowErrorModal([err]);
	}
}