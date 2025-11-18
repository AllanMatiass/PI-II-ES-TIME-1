/**
 * @name LoadStudentsList
 * @description Carrega a lista de matérias em um elemento de lista jquery
 * @param {object[]} list 
 * @param {HTMLTableElement} $table 
 * @returns 
 */

export function LoadSubjectsList(list, $table) {
	if (!$table || !$table.length) return;

	const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
	
	for (const subject of list) {

		// Converte as datas de string para objeto Date
		const startDate = new Date(subject.start_date);
		const endDate = new Date(subject.end_date);

		// HTML externo (linha)
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

			// Botão abrir lista de classes
			$linha
				.find('.bi-folder2-open')
				.closest('button')
				.on('click', () => {
					window.location.href ='/frontend/pages/dashboard/classes.html?subjectId=' + subject.id;
				});
			
			// Botão abrir lista de componentes de nota
			$linha
				.find('.bi-backpack')
				.closest('button')
				.on('click', () => {
					window.location.href ='/frontend/pages/dashboard/components.html?subjectId=' + subject.id;
				});

			// Botão alterar matéria
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

			// Botão excluir matéria
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