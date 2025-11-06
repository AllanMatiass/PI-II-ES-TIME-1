import { GetAuthHeaders } from "/frontend/scripts/utils/getAuthHeaders.js";
import { API_URL } from "/frontend/scripts/utils/config.js";
import { ShowErrors } from "/frontend/components/errors-modal/modal.js";

jQuery(document.body).load("/frontend/components/navbar/navbar.html", () => {
    const openProfileModalBtn = document.querySelector("#openProfileModalBtn");
    
    openProfileModalBtn.addEventListener("click", async () => {
        fetchProfileInfo();
    });
});

async function fetchProfileInfo() {
    try {
        const res = await fetch(`${API_URL}/api/account/profile`, {
            method: "GET",
            headers: GetAuthHeaders()
        });

        const body = await res.json();

        if (res.status != 200) {
            return ShowErrors(body.json);
        }

        $("#nomeTxt").val(body.data.name);
        $("#emailTxt").val(body.data.email);
        $("#telefoneTxt").val(body.data.phone);

	    const modal = new bootstrap.Modal(document.querySelector('#profile-modal'));
	    modal.show();
    } catch (err) {
        ShowErrors([err]);
    }
}