// Autores: Murilo e Cristian

import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadInstitutionRow } from "/frontend/components/institution-table/row.js";
import { API_URL } from "../utils/config.js";
import { GetAuthHeaders } from "../utils/getAuthHeaders.js";

const institutionList = [];

// Check if user is logged in
if (!localStorage.getItem("token")) {
    window.location.href = "/frontend/pages/auth/signin.html";
}

$("#search-btn").on("click", () => {
    ShowInstitutions($("#institution-search-input").val());
});

async function FetchInstitutions() {
    try {
        const res = await fetch(`${API_URL}/api/institution/all`, {
            method: "GET",
            headers: GetAuthHeaders()
        });

        const body = await res.json();

        if (res.status != 200) {
            return ShowErrorModal("Erro ao carregar instituições", [body.message]);
        }

        institutionList = Array.isArray(body.data) ? body.data : [];
        ShowInstitutions();

    } catch (err) {
        ShowErrorModal("Erro ao carregar instituições.", [err.message]);
    }
}

function ShowInstitutions(filter = "") {
    $("#institution-table-body").html("");

    for (const institution of institutionList) {
        if (institution.name.toLowerCase().includes(filter.toLowerCase())) {
            LoadInstitutionRow(institution, $("#institution-table-body"));
        }
    }
}

FetchInstitutions();
ShowInstitutions();