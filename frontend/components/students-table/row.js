export function LoadStudentsList(studentsList, gradesList, $table) {
	if (!$table || !$table.length) return;

	return console.log('Grades carregadas:', gradesList);

	for (const student of studentsList) {
		// Grades do aluno específico
		const studentGrades = gradesList.filter((g) => g.student_id === student.id);

		// Montar HTML das notas
		let notesHtml = '';

		for (const g of studentGrades) {
			const value = g.grade_value ?? '-';
			const final = g.is_final ? true : false;

			if (!final) {
				notesHtml += `
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span><b>${g.component_name}:</b></span>
                        <input type="number" step="0.01" class="form-control form-control-sm component-grade-input"
                            data-grade-id="${g.grade_id}"
                            data-component-id="${g.component_id}"
                            value="${value}"
                            disabled
                        />
                        <button class="btn btn-sm btn-outline-primary edit-grade-btn" data-grade-id="${g.grade_id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-success save-grade-btn d-none" data-grade-id="${g.grade_id}">
                            <i class="bi bi-check-lg"></i>
                        </button>
                    </div>
                `;
			} else {
				notesHtml += `
                    <div class="d-flex align-items-center gap-2 mt-2">
                        <span><b>Final:</b></span>
                        <input type="number" disabled class="form-control form-control-sm bg-light"
                            value="${value}"
                        />
                    </div>
                `;
			}
		}

		// Carregar o HTML da linha
		$.get('/frontend/components/students-table/row.html', (html) => {
			html = html
				.replace('{{student_id}}', student.id)
				.replace('{{registration_id}}', student.registration_id)
				.replace('{{name}}', student.name)
				.replace('{{notes_html}}', notesHtml);

			const $linha = $(html);

			$table.find('tbody').append($linha);

			// ================================
			// EVENTOS DE EDIÇÃO DE NOTAS
			// ================================

			// Apenas uma nota pode ser editada por vez
			let editing = null;

			$linha.find('.edit-grade-btn').on('click', function () {
				if (editing !== null) return;

				const gradeId = $(this).data('grade-id');

				editing = gradeId;

				$(this).addClass('d-none');
				$linha
					.find(`.save-grade-btn[data-grade-id="${gradeId}"]`)
					.removeClass('d-none');

				$linha
					.find(`input[data-grade-id="${gradeId}"]`)
					.prop('disabled', false);
			});

			$linha.find('.save-grade-btn').on('click', async function () {
				const gradeId = $(this).data('grade-id');

				const $input = $linha.find(`input[data-grade-id="${gradeId}"]`);
				const newValue = parseFloat($input.val());

				if (isNaN(newValue) || newValue < 0 || newValue > 10) {
					return alert('Insira uma nota válida entre 0 e 10.');
				}

				// Chamada ao backend
				const res = await fetch(`${API_URL}/component/${student.id}`, {
					method: 'POST',
					headers: GetAuthHeaders(),
					body: JSON.stringify({
						component_id: $input.data('component-id'),
						grade_value: newValue,
					}),
				});

				if (!res.ok) {
					alert('Erro ao salvar nota.');
					return;
				}

				// Disable edition mode
				$input.prop('disabled', true);
				$linha
					.find(`.save-grade-btn[data-grade-id="${gradeId}"]`)
					.addClass('d-none');
				$linha
					.find(`.edit-grade-btn[data-grade-id="${gradeId}"]`)
					.removeClass('d-none');

				editing = null;
			});

			// Eventos já existentes dos ícones do aluno
			$linha.find('.edit-student-btn').on('click', () => {
				$('#student-form').attr('data-student-id', student.id);
				$('#student-name-txt').val(student.name);
				$('#student-registration-id-txt')
					.val(student.registration_id)
					.attr('disabled', true);
				$('#student-modal-title').html('ALTERAR ALUNO');

				const modal = new bootstrap.Modal($('#student-modal')[0]);
				modal.show();
			});

			$linha.find('.delete-student-btn').on('click', () => {
				$('#delete-student-modal').attr(
					'data-student-id',
					student.registration_id
				);
				$('#delete-student-modal-title').html(
					`DESEJA EXCLUIR O ESTUDANTE ${student.name.toUpperCase()}?`
				);

				const modal = new bootstrap.Modal($('#delete-student-modal')[0]);
				modal.show();
			});
		});
	}
}
