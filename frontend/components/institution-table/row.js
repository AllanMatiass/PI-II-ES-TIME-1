export function LoadInstitutionList(list, $table) {
	if (!$table || !$table.length) return;

	for (let i = 0; i < list.length; i++) {
		const institution = list[i];

		// Carrega o HTML do arquivo externo
		$.get('/frontend/components/institution-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html
				.replace('{{count}}', i +1)
				.replace('{{nome}}', institution.name);

			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Liga os eventos dos botões
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href ='/frontend/pages/dashboard/course.html?institutionId=' + institution.id;
				});

			$linha
				.find('.bi-pencil')
				.closest('button')
				.on('click', () => {
					$('#institution-form').attr('data-institution-id', institution.id);
					$('#institution-name-txt').val(institution.name);
					$('#institution-modal-title').html('ALTERAR INSTITUIÇÃO');

					const modal = new bootstrap.Modal($('#institution-modal')[0]);
					modal.show();
				});

			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-institution-modal').attr('data-institution-id', institution.id);
					$('#delete-institution-modal-title').html(`DESEJA EXCLUIR A INSTITUIÇÃO ${institution.name.toUpperCase()}?`);

					const modal = new bootstrap.Modal($('#delete-institution-modal')[0]);
					modal.show();
				});
		});
	}
}
