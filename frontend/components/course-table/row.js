// Autor: Cristian Eduardo Fava

/**
 * @name LoadCoursesList
 * @description Carrega a lista de cursos em um elemento de lista jquery
 * @param {Object[]} list
 * @param {HTMLTableElement} $table
 */

export function LoadCoursesList(list, $table) {
	if (!$table || !$table.length) return;

	for (const course of list) {
		// HTML extorno (linha)
		$.get('/frontend/components/course-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html.replace('{{name}}', course.name);

			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Evento botão abrir lista de matérias
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href =
						'/frontend/pages/dashboard/subjects.html?courseId=' + course.id;
				});

			// Evento botão alterar curso
			$linha
				.find('.bi-pencil')
				.closest('button')
				.on('click', () => {
					$('#course-form').attr('data-course-id', course.id);
					$('#course-name-txt').val(course.name);
					$('#course-modal-title').html('ALTERAR CURSO');

					const modal = new bootstrap.Modal($('#course-modal')[0]);
					modal.show();
				});

			// Evento botão excluir curso
			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-course-modal').attr('data-course-id', course.id);
					$('#delete-course-modal-title').html(
						`DESEJA EXCLUIR O CURSO ${course.name.toUpperCase()}?`
					);

					const modal = new bootstrap.Modal($('#delete-course-modal')[0]);
					modal.show();
				});
		});
	}
}
