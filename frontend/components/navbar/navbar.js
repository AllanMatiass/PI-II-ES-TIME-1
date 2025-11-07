import { GetAuthHeaders } from "/frontend/scripts/utils/getAuthHeaders.js";
import { API_URL } from "/frontend/scripts/utils/config.js";
import { ShowErrors } from "/frontend/components/errors-modal/modal.js";

jQuery('#navbar-frame').load('/frontend/components/navbar/navbar.html', () => {
	const openProfileModalBtn = document.querySelector('#openProfileModalBtn');

	openProfileModalBtn.addEventListener('click', async () => {
		const profile = await fetchProfileInfo();
		if (!profile) return;

        console.log("a");

		$('#nomeTxt').val(body.data.name);
		$('#emailTxt').val(body.data.email);
		$('#telefoneTxt').val(body.data.phone);

		const modal = new bootstrap.Modal(document.querySelector('#profile-modal'));
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
			return ShowErrors(body.json);
		}

		return body;
	} catch (err) {
		ShowErrors([err]);
	}
}