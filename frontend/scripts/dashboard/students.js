// Autor: Cristian Fava

import { API_URL } from '../utils/config.js';
import { ShowErrorModal } from "/frontend/components/errors-modal/modal.js";
import { LoadStudentsList } from '/frontend/components/students-table/row.js';
import { GetAuthHeaders } from '../utils/getAuthHeaders.js';
import { isValidToken } from '../utils/verifyToken.js';

var studentList = [];
var gradesList = [];
var filter = '';

// Veririfica se o usuário está logado
if (!localStorage.getItem('token')) {
    window.location.href = '/frontend/pages/auth/signin.html';
}

$('#student-search-input').on('keyup', (ev) => {
    filter = ev.currentTarget.value;
    ShowStudents();
});

// Verifica se o ID da MATÉRIA está na URL
const params = new URLSearchParams(window.location.search);

const classId = params.get('classId');
const subjectId = params.get('subjectId');

if (!classId || !subjectId) {
    window.location.href = '/frontend/pages/dashboard/institutions.html';
}
 
$('#open-student-modal-btn').on('click', () => {
    $('#student-form')[0].reset();
    $('#student-form').removeAttr('data-student-id');
    $('#student-modal-title').html('CASDASTRAR ALUNO');
    $('#student-registration-id-txt').attr("disabled", false);

    const modal = new bootstrap.Modal($('#student-modal')[0]);
    modal.show();
});

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

$('#delete-student-btn').on('click', async () => {
    const studentId = $('#delete-student-modal').attr('data-student-id');
    await DeleteStudent(studentId);
});

async function CreateStudent(studentData) {
    try {
        console.log(Object.fromEntries(studentData));

        const res = await fetch(`${API_URL}/api/student/${classId}`, {
            method: 'POST',
            headers: GetAuthHeaders(),
            body: JSON.stringify(Object.fromEntries(studentData)),
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        if (!res.ok) {
            return ShowErrorModal('ERRO AO CRIAR ESTUDANTE', [body.error]);
        }

        studentList.push(body.data);
        ShowStudents();
    } catch (err) {
        ShowErrorModal('ERRO AO CRIAR ESTUDANTE', [err.message]);
    }
}

async function AlterStudent(id, data) {
    try {
        const res = await fetch(`${API_URL}/api/student/${classId}`, {
            method: 'PUT',
            headers: GetAuthHeaders(),
            body: JSON.stringify(Object.fromEntries(data)),
        });

        const body = await res.json();

        if (!isValidToken(res)){
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

async function DeleteStudent(registration_id) {
    try {
        const res = await fetch(`${API_URL}/api/student/${classId}/${registration_id}`, {
            method: 'DELETE',
            headers: GetAuthHeaders()
        });

        const body = await res.json();

        if (!isValidToken(res)){
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

async function FetchStudents() {
    try {
        const res = await fetch(`${API_URL}/api/students/${classId}`, {
            method: 'GET',
            headers: GetAuthHeaders(),
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }
        if (!res.ok) {
            return ShowErrorModal('ERRO AO CARREGAR OS ALUNOS', [body.message]);
        }

        studentList = body.data;
        ShowStudents();
    } catch (err) {
        ShowErrorModal('ERRO AO CARREGAR OS ALUNOS', [err.message]);
    }
}

async function FetchStudentsGrades() {
    try {
        const res = await fetch(`${API_URL}/api/class/${classId}/subject/${subjectId}/grades`, {
            method: 'GET',
            headers: GetAuthHeaders(),
        });

        const body = await res.json();

        if (!isValidToken(res)){
            window.location.href = '/frontend/pages/auth/signin.html';
            return;
        }

        if (!res.ok) {
            return ShowErrorModal('ERRO AO CARREGAR AS NOTAS', [body.error]);
        }


        gradesList = body.data;
        ShowStudents();
    } catch (err) {
        ShowErrorModal('ERRO AO CARREGAR AS NOTAS', [err.message]);
    }
}

function ShowStudents() {
    $('#students-table').find('tbody').html('');

    const filteredList = studentList.filter((inst) =>
        inst.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    LoadStudentsList(filteredList, gradesList, $('#students-table'));
}

FetchStudentsGrades();
FetchStudents();
ShowStudents();