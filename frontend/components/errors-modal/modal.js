// Autor: Cristian Eduardo Fava

/**
 * @name ShowErrorModal
 * @description Exibe um modal informando um ou mais erros
 * @param {string} title
 * @param {string[]} errors
 */

export function ShowErrorModal(title, errors) {
    // Se o modal não existe, cria um novo
	if (!$('#errors-modal').length) {
		$.get('/frontend/components/errors-modal/modal.html', (html) => {
			$(document.body).prepend(html);
			InitalizeModal(title, errors);
		});
	} else {
		InitalizeModal(title, errors);
	}
}

// Inicializa e exibe o modal
function InitalizeModal(title, errors) {
	const $modal = $('#errors-modal');

	if (!errors) return;

	const list = errors.map((e) => `<li>${e}</li>`).join('');

    // Atribui os erros
	$modal.find('#error-modal-title').html(title);
	$modal.find('#modal-errors-list').html(`${list}`);

	const modal = new bootstrap.Modal($modal[0]);
	modal.show();
}
