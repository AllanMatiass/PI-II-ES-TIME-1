// Modal de erros

// jQuery(document.body).load("/frontend/components/errors-modal/modal.html");

export function ShowErrors(title, errors) {
    if (!errors) return;
    
    const list = errors.map((e) => `<li>${e}</li>`).join('');
    
    $('#error-modal-title').html(title);
    $('#modal-errors-list').html(`${list}`);
    
	const modal = new bootstrap.Modal(document.querySelector('#errors-modal'));
	modal.show();
}