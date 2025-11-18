// Autor: Cristian Eduardo Fava

/**
 * @name LoadInstitutionList
 * @description Carrega a lista de instituições em um elemento de lista jquery
 * @param {Object[]} list
 * @param {HTMLTableElement} $table
 */
export function LoadInstitutionList(list, $table) {
	if (!$table || !$table.length) return;

	for (const institution of list) {

		// HTML externo (linha)
		$.get('/frontend/components/institution-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html.replace('{{name}}', institution.name);

			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Evento botão abrir lista de cursos
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href =
						'/frontend/pages/dashboard/courses.html?institutionId=' +
						institution.id;
				});

			// Evento botão alterar instituição
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

			// Evento botão excluir instituição
			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-institution-modal').attr(
						'data-institution-id',
						institution.id
					);
					$('#delete-institution-modal-title').html(
						`DESEJA EXCLUIR A INSTITUIÇÃO ${institution.name.toUpperCase()}?`
					);

					const modal = new bootstrap.Modal($('#delete-institution-modal')[0]);
					modal.show();
				});
		});
	}
}
