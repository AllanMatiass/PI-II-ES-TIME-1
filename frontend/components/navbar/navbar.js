import { GetAuthHeaders } from "/frontend/scripts/utils/getAuthHeaders.js";
import { API_URL } from "/frontend/scripts/utils/config.js";
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";

$.get('/frontend/components/navbar/navbar.html', (html) => {
	const $navbar = $(html);

	$(document.body).prepend($navbar);

	$navbar.find('#openProfileModalBtn')
		.on('click', async () => {
			const profile = await fetchProfileInfo();
			if (!profile) return;

			$navbar.find('#nomeTxt').val(profile.data.name);
			$navbar.find('#emailTxt').val(profile.data.email);
			$navbar.find('#telefoneTxt').val(profile.data.phone);

			const modal = new bootstrap.Modal($navbar.find('#profile-modal')[0]);
			modal.show();
		});
});

async function fetchProfileInfo() {
	try {
		const res = await fetch(`${API_URL}/api/account/profile`, {
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