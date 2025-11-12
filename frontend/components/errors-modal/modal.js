// Modal de erros

export function ShowErrorModal(title, errors) {
    if (!$('#errors-modal').length) {
        $.get('/frontend/components/errors-modal/modal.html', (html) => {
            $(document.body).prepend(html);
            InitalizeModal(title, errors);
        });
    } else {
        InitalizeModal(title, errors);
    }
}

function InitalizeModal(title, errors) {
    const $modal = $("#errors-modal");
    
    if (!errors) return;
    
    const list = errors.map((e) => `<li>${e}</li>`).join('');
    
    $modal.find('#error-modal-title').html(title);
    $modal.find('#modal-errors-list').html(`${list}`);
    
	const modal = new bootstrap.Modal($modal[0]);
	modal.show();
}