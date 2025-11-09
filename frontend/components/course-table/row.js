export function LoadCoursesList(list, $table) {
	if (!$table || !$table.length) return;

	for (let i = 0; i < list.length; i++) {
		const course = list[i];

		// Carrega o HTML do arquivo externo
		$.get('/frontend/components/course-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html
				.replace('{{count}}', i +1)
				.replace('{{nome}}', course.name);

			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

            // Liga os eventos dos botões
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href ='/frontend/pages/dashboard/disciplines.html?courseId=' + course.id;
				});

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

			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-course-modal').attr('data-course-id', course.id);
					$('#delete-course-modal-title').html(`DESEJA EXCLUIR O CURSO ${course.name.toUpperCase()}?`);

					const modal = new bootstrap.Modal($('#delete-course-modal')[0]);
					modal.show();
				});
		});
	}
}
