import { API_URL } from "../utils/config.js";
import { GetAuthHeaders } from "./instituicao.js";

let cursos = [];
let topBar;
let btnAddCurso;
let inputPesquisaCurso;
let instituicaoSelecionadaId = null;

// Função principal de carregamento de dados
async function carregarCursos(institutionId = null) {
    try {
        let url = `${API_URL}/api/courses`;
        if (institutionId) {
            url += `/${institutionId}`;
        }
        const res = await fetch(url, {
            method: "GET",
            headers: GetAuthHeaders()
        });

        const body = await res.json();

        if (res.status !== 200) {
            throw new Error(body.message || `Erro ao buscar cursos. Código: ${res.status}`);
        }

        // Corrigido: pega cursos de body.data
        cursos = Array.isArray(body.data) ? body.data : [];
        renderizarCursos(cursos);

    } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        renderizarCursos([]); 
    }
}

function renderizarCursos(lista) {
    if (!topBar) return;

    let listaExistente = topBar.querySelector(".lista-cursos");
    if (listaExistente) listaExistente.remove();

    let msgVazio = topBar.querySelector(".msg-vazio");
    if (msgVazio) msgVazio.remove();

    const listaUL = document.createElement("ul");
    listaUL.classList.add("lista-cursos");

    if (lista.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = inputPesquisaCurso && inputPesquisaCurso.value.length > 0
            ? "Nenhum curso encontrado com este termo."
            : "Nenhum curso cadastrado para esta instituição.";
        vazio.classList.add("msg-vazio");
        topBar.appendChild(vazio);
        return;
    }

    lista.forEach(curso => {
        const li = document.createElement("li");
        li.classList.add("item-curso");

        const nomeTexto = `Curso ${curso.name || 'Curso Sem Nome'}`;
        
        const nome = document.createElement("span");
        nome.textContent = nomeTexto;
        
        nome.addEventListener("click", () => {
            li.classList.toggle("selecionado");
        });

        const botoes = document.createElement("div");
        botoes.classList.add("acoes");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");
        btnEditar.addEventListener("click", (e) => {
             e.stopPropagation();
             editarCurso(curso);
        });

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.classList.add("btn-excluir");
        btnExcluir.addEventListener("click", (e) => {
             e.stopPropagation();
             excluirCurso(curso.id);
        });

        botoes.appendChild(btnEditar);
        botoes.appendChild(btnExcluir);

        li.appendChild(nome);
        li.appendChild(botoes);
        listaUL.appendChild(li);
    });

    topBar.appendChild(listaUL);
}

function setupAdicionarCurso() {
    if (!btnAddCurso) return;

    btnAddCurso.addEventListener("click", () => {
        if (topBar.querySelector("#formNovoCurso")) return;

        const form = document.createElement("form");
        form.id = "formNovoCurso";
        form.innerHTML = `
            <h3>Novo Curso</h3>
            <input type="text" id="course-name" placeholder="Nome do Curso" required />
            <div class="botoesForm">
                <button type="submit">Salvar Curso</button>
                <button type="button" id="cancelar-curso">Cancelar</button>
            </div>
        `;

        topBar.appendChild(form);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = form.querySelector("#course-name").value.trim();

            try {
                const res = await fetch(`${API_URL}/api/course`, {
                    method: "POST",
                    headers: GetAuthHeaders(),
                    body: JSON.stringify({ name, institution_id: instituicaoSelecionadaId })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Erro ao criar curso");

                alert("Curso criado com sucesso!");
                form.remove();
                carregarCursos(instituicaoSelecionadaId);

            } catch (err) {
                alert(`Erro ao criar curso: ${err.message}`);
            }
        });

        form.querySelector("#cancelar-curso").addEventListener("click", () => form.remove());
    });
}

async function editarCurso(curso) {
    const novoNome = prompt("Novo nome:", curso.name);
    const novoCodigo = prompt("Novo código:", curso.code);
    
    if (!novoNome || !novoCodigo) return;

    try {
        const res = await fetch(`${API_URL}/api/course`, {
            method: "PUT",
            headers: GetAuthHeaders(),
            body: JSON.stringify({ 
                id: curso.id, 
                name: novoNome, 
                code: novoCodigo,
                description: curso.description
            })
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Erro ao editar curso");

        alert("Curso atualizado!");
        carregarCursos(instituicaoSelecionadaId);

    } catch (err) {
        alert(`Erro ao editar curso: ${err.message}`);
    }
}

async function excluirCurso(id) {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
        const res = await fetch(`${API_URL}/api/course/${id}`, {
            method: "DELETE",
            headers: GetAuthHeaders()
        });

        if (!res.ok) throw new Error("Erro ao excluir curso");
        alert("Curso removido com sucesso!");
        carregarCursos(instituicaoSelecionadaId);

    } catch (err) {
        alert(`Erro ao excluir curso: ${err.message}`);
    }
}

function setupFiltroCursos() {
    if (!inputPesquisaCurso) return;

    inputPesquisaCurso.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        
        const filtrados = cursos.filter(c => 
            (c.name || "").toLowerCase().includes(termo) ||
            (c.code || "").toLowerCase().includes(termo)
        );
        
        renderizarCursos(filtrados);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    topBar = document.querySelector(".topBar");
    inputPesquisaCurso = document.querySelector("#pesqCurso");
    btnAddCurso = topBar ? topBar.querySelector("#btnAddCurso") : null; 

    if (!topBar) {
        console.error("Não foi possível encontrar o elemento .topBar. O script de curso não pode ser executado.");
        return;
    }

    setupAdicionarCurso();
    setupFiltroCursos();

    // Escuta seleção de instituição
    window.addEventListener("instituicaoSelecionada", (e) => {
        instituicaoSelecionadaId = e.detail.id;
        carregarCursos(instituicaoSelecionadaId);
        console.log(instituicaoSelecionadaId)
    });

    carregarCursos();
});