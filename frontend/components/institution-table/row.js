export function LoadInstitutionRow(institution, $table) {
	if (!institution || !$table || !$table.length) return;

	// Carrega o HTML do arquivo externo
	$.get('linha-instituicao.html', (html) => {
		// Substitui os placeholders pelos dados reais
		html = html
			.replace('{{id}}', institution.id)
			.replace('{{nome}}', institution.nome);

		// Converte o HTML em um elemento jQuery
		const $linha = $(html);

		// Adiciona a linha ao corpo da tabela
		$table.find('tbody').append($linha);

		// Liga os eventos dos botões
		$linha
			.find('.bi-folder2-open')
			.closest('button')
			.on('click', () => {
                console.log('Abrir instituição:', institution);
                window.location.href = "/frontend/pages/dashboard/courses/" + institution.id;
			});

		$linha
			.find('.bi-pencil')
			.closest('button')
			.on('click', () => {
                console.log('Alterar instituição:', institution);
                
			});

		$linha
			.find('.bi-trash')
			.closest('button')
			.on('click', () => {
				console.log('Excluir instituição:', institution);
			});
	});
}
