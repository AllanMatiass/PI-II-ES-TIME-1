export function LoadClassesList(list, $table) {
	const params = new URLSearchParams(window.location.search);
	const subjectId = params.get("subjectId");

	if (!$table || !$table.length) return;

	for (const _class of list) {
		console.log(_class.id);

		// Carrega o HTML do arquivo externo
		$.get('/frontend/components/class-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html
				.replace('{{name}}', _class.name)
				.replace('{{location}}', _class.classroom)
                
			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Liga os eventos dos botões
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href =`/frontend/pages/dashboard/students.html?classId=${_class.id}&subjectId=${subjectId}`;
				});

			$linha
				.find('.bi-pencil')
				.closest('button')
				.on('click', () => {
					$('#class-form').attr('data-class-id', _class.id);
					$('#class-name-txt').val(_class.name);
					$('#class-location-txt').val(_class.classroom);
					$('#class-modal-title').html('ALTERAR TURMA');

					const modal = new bootstrap.Modal($('#class-modal')[0]);
					modal.show();
				});

			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-class-modal').attr('data-class-id', _class.id);
					$('#delete-class-modal-title').html(`DESEJA EXCLUIR A TURMA ${_class.name.toUpperCase()}?`);

					const modal = new bootstrap.Modal($('#delete-class-modal')[0]);
					modal.show();
				});
		});
	}
}