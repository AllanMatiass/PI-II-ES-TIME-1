// LoadStudentsList.js
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { API_URL } from '/frontend/scripts/utils/config.js';
import { GetAuthHeaders } from '/frontend/scripts/utils/getAuthHeaders.js';

// Cache templates
let rowTemplate = null;
let noteTemplate = null;
let finalNoteTemplate = null;

const params = new URLSearchParams(window.location.search);
const subjectId = params.get('subjectId');

/**
 * Substitui várias chaves do template.
 * map = { key: value } para substituir {{key}} -> value
 */
function fill(template, map) {
	let out = template;
	for (const k in map) {
		// substitui todas as ocorrências
		out = out.split(`{{${k}}}`).join(map[k] ?? '');
	}
	return out;
}

/**
 * studentsList: array de alunos
 * gradesList: array retornado pela API (cada item: { student_id, components: [...], final_grade })
 * $table: jQuery table element
 */
export async function LoadStudentsList(studentsList, gradesList, $table) {
	if (!$table || !$table.length) return;

	// Limpa a tabela
	const $tbody = $table.find('tbody');
	$tbody.empty();

	// Carrega templates apenas uma vez
	if (!rowTemplate) {
		// caminhos conforme sua estrutura
		rowTemplate = await $.get('/frontend/components/students-table/row.html');
		noteTemplate = await $.get('/frontend/components/students-table/note.html');
		finalNoteTemplate = await $.get(
			'/frontend/components/students-table/final-note.html'
		);
	}

	// Para cada aluno
	for (const student of studentsList) {
		// encontra info de notas do aluno
		const gradeInfo =
			(gradesList || []).find((g) => g.student_id === student.id) || {};
		const components = gradeInfo.components || [];
		const finalGrade = gradeInfo.final_grade ?? '-';

		// monta linha
		const rowHtml = fill(rowTemplate, {
			student_id: student.id,
			registration_id: student.registration_id ?? '',
			name: student.name ?? '',
		});

		const $linha = $(rowHtml);

		// preencher notas (cada note terá grade_key = studentId__componentId)
		const $notesCell = $linha.find('.notes-cell');

		for (const comp of components) {
			const gradeKey = `${student.id}__${comp.component_id}`;

			const noteHtml = fill(noteTemplate, {
				grade_key: gradeKey,
				component_id: comp.component_id,
				component_name: comp.component_name ?? comp.formula_acronym ?? '',
				value: comp.grade_value === 0 ? '0' : comp.grade_value ?? '-',
			});

			const $note = $(noteHtml);
			$notesCell.append($note);
		}

		// nota final
		const $final = $(fill(finalNoteTemplate, { value: finalGrade }));
		$notesCell.append($final);

		// append linha
		$tbody.append($linha);

		// bind de eventos por linha (delegation local)
		attachRowHandlers($linha, student);
	}
}

/**
 * Anexa handlers DELEGADOS ao $linha para evitar múltiplas binding e garantir escopo.
 */
function attachRowHandlers($linha, student) {
	// editar aluno / deletar
	$linha
		.find('.edit-student-btn')
		.off('click')
		.on('click', function () {
			$('#student-form').attr('data-student-id', student.id);
			$('#student-name-txt').val(student.name);
			$('#student-registration-id-txt')
				.val(student.registration_id)
				.attr('disabled', true);
			$('#student-modal-title').html('ALTERAR ALUNO');
			new bootstrap.Modal($('#student-modal')[0]).show();
		});

	$linha
		.find('.delete-student-btn')
		.off('click')
		.on('click', function () {
			$('#delete-student-modal').attr(
				'data-student-id',
				student.registration_id
			);
			$('#delete-student-modal-title').html(
				`DESEJA EXCLUIR O ESTUDANTE ${student.name.toUpperCase()}?`
			);
			new bootstrap.Modal($('#delete-student-modal')[0]).show();
		});

	// controle de edição por linha
	let editingKey = null;

	// ===== ABRIR EDIÇÃO =====
	$linha
		.off('click', '.edit-grade-btn')
		.on('click', '.edit-grade-btn', function () {
			if (editingKey !== null) return;

			const $noteLine = $(this).closest('.note-line');
			const gradeKey = $noteLine.data('grade-id');

			editingKey = gradeKey;

			$(this).addClass('d-none');
			$noteLine.find('.save-grade-btn').removeClass('d-none');

			$noteLine.find('input.component-grade-input').prop('disabled', false);
		});

	// ===== SALVAR =====
	$linha
		.off('click', '.save-grade-btn')
		.on('click', '.save-grade-btn', async function () {
			const $noteLine = $(this).closest('.note-line');
			const gradeKey = $noteLine.data('grade-id');

			const $input = $noteLine.find('input.component-grade-input');
			const newValue = parseFloat($input.val());

			if (isNaN(newValue) || newValue < 0 || newValue > 10) {
				alert('Insira uma nota válida entre 0 e 10.');
				return;
			}

			const [student_id, component_id] = String(gradeKey).split('__');

			try {
				const res = await fetch(`${API_URL}/api/subject/${subjectId}/grades`, {
					method: 'POST',
					headers: GetAuthHeaders(),
					body: JSON.stringify({
						student_id,
						component_id,
						grade_value: newValue,
					}),
				});

				const body = await res.json();

				if (!res.ok) {
					return ShowErrorModal(
						'Erro ao salvar nota: ' + (body.error || res.statusText)
					);
				}

				$input.prop('disabled', true);
				$noteLine.find('.save-grade-btn').addClass('d-none');
				$noteLine.find('.edit-grade-btn').removeClass('d-none');

				editingKey = null;

				if (body.data.final_grade !== undefined) {
					$linha.find('.final-grade-input').val(body.data.final_grade);
				}
			} catch (err) {
				console.error(err);
				ShowErrorModal('Erro ao salvar nota: ' + err.message);
			}
		});
}
