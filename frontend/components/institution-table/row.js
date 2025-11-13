import { FetchInstitutions } from '/frontend/scripts/dashboard/institutions.js';
import { ShowErrorModal } from '/frontend/components/errors-modal/modal.js';
import { API_URL } from '/frontend/scripts/utils/config.js';
import { GetAuthHeaders } from '/frontend/scripts/utils/getAuthHeaders.js';
import { isValidToken } from '/frontend/scripts/utils/verifyToken.js';

async function EnterInInstitution(institutionId) {
	try {
		const professorId = localStorage.getItem('userId');

		const res = await fetch(`${API_URL}/api/institution/relateWithProfessor`, {
			method: 'POST',
			headers: GetAuthHeaders(),
			body: JSON.stringify({
				institutionId,
				professorId,
			}),
		});

		const body = await res.json();

		if (!isValidToken(res)) {
			window.location.href = '/frontend/pages/auth/signin.html';
			return;
		}

		if (res.status != 200) {
			ShowErrorModal('ERRO AO ENTRAR NA INSTITUIÇÃO', [body.error]);
			return false;
		}

		return true;
	} catch (err) {
		ShowErrorModal('ERRO AO CRIAR INSTITUIÇÃO', [err.message]);
		return false;
	}
}

export function LoadInstitutionList(list, $table) {
	if (!$table || !$table.length) return;

	for (const { institution, professors } of list) {
		// Carrega o HTML do arquivo externo
		$.get('/frontend/components/institution-table/row.html', (html) => {
			// Substitui os placeholders pelos dados reais
			html = html.replace('{{name}}', institution.name);

			// Converte o HTML em um elemento jQuery
			const $linha = $(html);

			// Adiciona a linha ao corpo da tabela
			$table.find('tbody').append($linha);

			// Liga os eventos dos botões
			
			// Professor não está na instituição
			const professorId = localStorage.getItem('userId');

			if (!professors.find((p) => p.id === professorId)) {
				$linha
					.find('.bi-building-up')
					.closest('button')
					.removeClass('d-none')
					.on('click', async (ev) => {
						const success = await EnterInInstitution(institution.id);

						if (success) {
							FetchInstitutions();
						}
					});
			} else {
				$linha
					.find('.bi-folder2-open')
					.closest('button')
					.removeClass('d-none')
					.on('click', () => {
						window.location.href =
							'/frontend/pages/dashboard/courses.html?institutionId=' +
							institution.id;
					});

				$linha
					.find('.bi-pencil')
					.closest('button')
					.removeClass('d-none')
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
					.removeClass('d-none')
					.on('click', () => {
						$('#delete-institution-modal').attr(
							'data-institution-id',
							institution.id
						);
						$('#delete-institution-modal-title').html(
							`DESEJA EXCLUIR A INSTITUIÇÃO ${institution.name.toUpperCase()}?`
						);

						const modal = new bootstrap.Modal(
							$('#delete-institution-modal')[0]
						);
						modal.show();
					});
			}
		});
	}
}
