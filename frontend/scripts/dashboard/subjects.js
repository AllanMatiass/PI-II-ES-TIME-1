// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadSubjectsList } from '/frontend/components/subject-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var subjectsList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
    window.location.href = '/frontend/pages/auth/signin.html';
}

// Verifica se o ID da MATÉRIA está na URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('courseId');

if (!courseId) {
    window.location.href = '/frontend/pages/dashboard/institutions.html';
}

$('#subject-search-input').on('keyup', (ev) => {
    filter = ev.currentTarget.value;
    ShowSubjects();
});

$('#open-subject-modal-btn').on('click', () => {
    $('#subject-form')[0].reset();
    $('#subject-form').removeAttr('data-subject-id');
    $('#subject-modal-title').html('CRIAR DISCIPLINA');

    const modal = new bootstrap.Modal($('#subject-modal')[0]);
    modal.show();
});

$('#return-btn').on('click', () => {
    window.location.href = `/frontend/pages/dashboard/courses.html?courseId=${courseId}`;
});

$('#save-subject-btn').on('click', async () => {
    const subjectId = $('#subject-form').attr('data-subject-id');
    const formdata = new FormData($('#subject-form')[0]);

    if (!subjectId) {
        await CreateSubject(formdata);
    } else {
        await AlterSubject(subjectId, formdata);
    }

    const modal = bootstrap.Modal.getInstance($('#subject-modal')[0]);
    modal.hide();
});

$('#delete-subject-btn').on('click', async () => {
    const subjectId = $('#delete-subject-modal').attr('data-subject-id');
    await DeleteSubject(subjectId);
});

async function CreateSubject(data) {
    try {
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

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        if (res.status != 200) {
            return ShowErrorModal('ERRO AO CRIAR MATÉRIA', [body.error]);
        }

        subjectsList.push(body.data);
        ShowSubjects();
    } catch (err) {
        ShowErrorModal('ERRO AO CRIAR MATÉRIA', [err.message]);
    }
}

async function AlterSubject(id, subjectName) {
    try {
        const res = await fetch(`${API_URL}/api/subject/${id}`, {
            method: 'PUT',
            headers: GetAuthHeaders(),
            body: JSON.stringify({
                name: subjectName
            }),
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }
        
        if (res.status != 200) {
            return ShowErrorModal('ERRO AO ALTERAR MATÉRIA', [body.error]);
        }

        await FetchSubjects();
    } catch (err) {
        ShowErrorModal('ERRO AO ALTERAR MATÉRIA', [err.message]);
    }
}

async function DeleteSubject(id) {
    try {
        const res = await fetch(`${API_URL}/api/subject/${id}`, {
            method: 'DELETE',
            headers: GetAuthHeaders()
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        if (res.status != 200) {
            return ShowErrorModal('ERRO AO EXCLUIR MATÉRIA', [body.error]);
        }

        await FetchSubjects();
    } catch (err) {
        ShowErrorModal('ERRO AO EXCLUIR MATÉRIA', [err.message]);
    }

    const modal = bootstrap.Modal.getInstance($('#delete-subject-modal')[0]);
    modal.hide();
}

async function FetchSubjects() {    
    try {
        const res = await fetch(`${API_URL}/api/course/${courseId}/subjects`, {
            method: 'GET',
            headers: GetAuthHeaders(),
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        if (res.status != 200) {
            return ShowErrorModal('ERRO AO CARREGAR MATÉRIAS', [body.message]);
        }

        subjectsList = body.data;
        ShowSubjects();
    } catch (err) {
        ShowErrorModal('ERRO AO CARREGAR MATÉRIAS', [err.message]);
    }
}

function ShowSubjects() {
    $('#subject-table').find('tbody').html('');

    const filteredList = subjectsList.filter((c) =>
        c.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    LoadSubjectsList(filteredList, $('#subject-table'));
}

FetchSubjects();
ShowSubjects();