// Autor: Cristian Fava

export function LoadComponentList(list, $table) {
    for (const comp of list) {

        $.get('/frontend/components/component-table/row.html', html => {

            html = html
                .replace('{{id}}', comp.id)
                .replace('{{name}}', comp.name)
                .replace('{{formula_acronym}}', comp.formula_acronym)
                .replace('{{description}}', comp.description ?? '');

            const $row = $(html);

            $table.find('tbody').append($row);

            // editar
            $row.find('.edit-component-btn').on('click', () => {
                $('#component-form').attr('data-component-id', comp.id);

                $('#component-name').val(comp.name);
                $('#component-acronym').val(comp.formula_acronym);
                $('#component-description').val(comp.description ?? '');

                $('#component-modal-title').html('ALTERAR COMPONENTE');

                new bootstrap.Modal($('#component-modal')[0]).show();
            });

            // deletar
            $row.find('.delete-component-btn').on('click', () => {

                $('#delete-component-modal')
                    .attr('data-component-id', comp.id);

                $('#delete-component-modal-title')
                    .html(`Deseja excluir o componente <b>${comp.name}</b>?`);

                new bootstrap.Modal($('#delete-component-modal')[0]).show();
            });
        });
    }
}
