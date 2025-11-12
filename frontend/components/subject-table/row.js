export function LoadSubjectsList(list, $table) {
	if (!$table || !$table.length) return;

	const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
	
	for (const subject of list) {

		const startDate = new Date(subject.start_date);
		const endDate = new Date(subject.end_date);

		// Carrega o HTML do arquivo externo
		$.get('/frontend/components/subject-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html
				.replace('{{name}}', subject.name)
				.replace('{{code}}', subject.code)
				.replace('{{period}}', subject.period)
				.replace('{{acronym}}', subject.acronym)
				.replace('{{start}}', startDate.toLocaleDateString('pt-BR', formatOptions))
				.replace('{{end}}', endDate.toLocaleDateString('pt-BR', formatOptions));
                
			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Liga os eventos dos botões
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href ='/frontend/pages/dashboard/classes.html?subjectId=' + subject.id;
				});

			$linha
				.find('.bi-pencil')
				.closest('button')
				.on('click', () => {
					$('#subject-form').attr('data-subject-id', subject.id);
					$('#subject-name-txt').val(subject.name);
					$('#subject-code-txt').val(subject.code);
					$('#subject-acronym-txt').val(subject.acronym);
					$('#subject-period-nb').val(subject.period);
					$('#subject-start-date').val(startDate.toISOString().split('T')[0]);
					$('#subject-end-date').val(endDate.toISOString().split('T')[0]);
					
					$('#subject-form-title').html('ALTERAR DISCIPLINA');

					const modal = new bootstrap.Modal($('#subject-modal')[0]);
					modal.show();
				});

			$linha
				.find('.bi-trash')
				.closest('button')
				.on('click', () => {
					$('#delete-subject-modal').attr('data-subject-id', subject.id);
					$('#delete-subject-modal-title').html(`DESEJA EXCLUIR A DISCIPLINA ${subject.name.toUpperCase()}?`);

					const modal = new bootstrap.Modal($('#delete-subject-modal')[0]);
					modal.show();
				});
		});
	}
}