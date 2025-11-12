// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadCoursesList } from '/frontend/components/course-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var coursesList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
	window.location.href = '/frontend/pages/auth/signin.html';
}

// Verifica se o ID da instituição está na URL
const params = new URLSearchParams(window.location.search);
const instituionId = params.get('institutionId');

if (!instituionId) {
	window.location.href = '/frontend/pages/dashboard/institutions.html';
} else {
    CheckInstitutionExists(instituionId);
}

$('#course-search-input').on('keyup', (ev) => {
    filter = ev.currentTarget.value;
    ShowCourses();
});

$('#open-course-modal-btn').on('click', () => {
    $('#course-form')[0].reset();
    $('#course-form').removeAttr('data-course-id');
    $('#course-modal-title').html('CRIAR CURSO');

    const modal = new bootstrap.Modal($('#course-modal')[0]);
    modal.show();
});

$('#return-btn').on('click', () => {
    window.location.href = `/frontend/pages/dashboard/institutions.html`;
});

$('#save-course-btn').on('click', async () => {
    const courseId = $('#course-form').attr('data-course-id');
    const formdata = new FormData($('#course-form')[0]);

    if (!courseId) {
        await CreateCourse(formdata.get('course-name'));
    } else {
        await AlterCourse(courseId, formdata.get('course-name'));
    }

    const modal = bootstrap.Modal.getInstance($('#course-modal')[0]);
    modal.hide();
});

$('#delete-course-btn').on('click', async () => {
    const courseId = $('#delete-course-modal').attr('data-course-id');
    await DeleteCourse(courseId);
});

async function CreateCourse(courseName) {
    try {
        const res = await fetch(`${API_URL}/api/course`, {
            method: 'POST',
            headers: GetAuthHeaders(),
            body: JSON.stringify({
                name: courseName,
                institution_id: instituionId
            })
        });


        const body = await res.json();

        if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

        if (res.status != 200) {
            return ShowErrorModal('ERRO AO CRIAR INSTITUIÇÃO', [body.error]);
        }

        coursesList.push(body.data);
        ShowCourses();
    } catch (err) {
        ShowErrorModal('ERRO AO CRIAR INSTITUIÇÃO', [err.message]);
    }
}

async function AlterCourse(id, courseName) {
    try {
        const res = await fetch(`${API_URL}/api/course/${id}`, {
            method: 'PUT',
            headers: GetAuthHeaders(),
            body: JSON.stringify({
                name: courseName
            }),
        });


        const body = await res.json();

        if (!isValidToken(res)){
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}
        
        if (res.status != 200) {
            return ShowErrorModal('ERRO AO ALTERAR INSTITUIÇÃO', [body.error]);
        }

        await FetchCourses();
    } catch (err) {
        ShowErrorModal('ERRO AO ALTERAR INSTITUIÇÃO', [err.message]);
    }
}

async function DeleteCourse(id) {
    try {
        const res = await fetch(`${API_URL}/api/course/${id}`, {
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

        await FetchCourses();
    } catch (err) {
        ShowErrorModal('ERRO AO EXCLUIR INSTITUIÇÃO', [err.message]);
    }

    const modal = bootstrap.Modal.getInstance($('#delete-course-modal')[0]);
    modal.hide();
}

async function FetchCourses() {
    try {
        const res = await fetch(`${API_URL}/api/courses/${instituionId}`, {
            method: 'GET',
            headers: GetAuthHeaders(),
        });
        
        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        const body = await res.json();

        if (res.status != 200) {
            return ShowErrorModal('ERRO AO CARREGAR CURSOS', [body.message]);
        }

        coursesList = body.data;
        ShowCourses();
    } catch (err) {
        ShowErrorModal('ERRO AO CARREGAR CURSOS', [err.message]);
    }
}

async function CheckInstitutionExists(id) {
    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: 'GET',
            headers: GetAuthHeaders(),
        });
        
        if (res.status != 200) {
            window.location.href = '/frontend/pages/dashboard/institutions.html';
        }
    } catch (err) {
        ShowErrorModal('ERRO AO VERIFICAR INSTITUIÇÃO', [err.message]);
        window.location.href = '/frontend/pages/dashboard/institutions.html';
    }
}

function ShowCourses() {
    $('#course-table').find('tbody').html('');

    const filteredList = coursesList.filter((c) =>
        c.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    LoadCoursesList(filteredList, $('#course-table'));
}

FetchCourses();
ShowCourses();