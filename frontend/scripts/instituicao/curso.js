import { API_URL } from "../utils/config.js";

// Variáveis globais para os dados e elementos do DOM
let cursos = [];
let topBar; // Container para o gerenciamento de cursos
let btnAddCurso; // Botão de Adicionar
let inputPesquisaCurso; // Campo de Pesquisa

// --- FUNÇÕES DE CARREGAMENTO E RENDERIZAÇÃO ---

// Função principal de carregamento de dados
async function carregarCursos() {
    try {
        console.log("Iniciando carregamento de cursos...");
        // Rotas do backend (TS): GET /api/institution/courses
        const res = await fetch(`${API_URL}/api/institution/courses`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
        });

        const body = await res.json();

        if (res.status !== 200) {
            throw new Error(body.message || `Erro ao buscar cursos. Código: ${res.status}`);
        }

        console.log("Cursos carregados:", body);

        // 1. ATUALIZA A VARIÁVEL GLOBAL
        cursos = Array.isArray(body) ? body : [];

        // 2. Chama a função de renderização
        renderizarCursos(cursos);

    } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        // Exibe erro na interface ou mantém a lista vazia
        renderizarCursos([]); 
    }
}


// Função para renderizar a lista na tela
function renderizarCursos(lista) {
    if (!topBar) return;

    // Remove listas anteriores
    let listaExistente = topBar.querySelector(".lista-cursos");
    if (listaExistente) listaExistente.remove();

    // Remove mensagem de "vazio" anterior (se houver)
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

        const nomeTexto = `[${curso.code || 'S/C'}] ${curso.name || 'Curso Sem Nome'}`;
        
        const nome = document.createElement("span");
        nome.textContent = nomeTexto;
        
        // Listener de clique para SELEÇÃO (Lógica do seu HTML)
        nome.addEventListener("click", () => {
            console.log(`Curso Selecionado: ${curso.name} (ID: ${curso.id})`);
            li.classList.toggle("selecionado");
        });

        const botoes = document.createElement("div");
        botoes.classList.add("acoes");

        // Botão Editar
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");
        btnEditar.addEventListener("click", (e) => {
             e.stopPropagation(); // Evita que o clique acione a seleção do curso
             editarCurso(curso);
        });

        // Botão Excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.classList.add("btn-excluir");
        btnExcluir.addEventListener("click", (e) => {
             e.stopPropagation(); // Evita que o clique acione a seleção do curso
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


// --- FUNÇÕES DE CRUD (Create, Update, Delete) ---

// Configuração do formulário de Adicionar
function setupAdicionarCurso() {
    if (!btnAddCurso) return;

    btnAddCurso.addEventListener("click", () => {
        // Se o formulário já estiver aberto, não faz nada
        if (topBar.querySelector("#formNovoCurso")) return;

        const form = document.createElement("form");
        form.id = "formNovoCurso";
        form.innerHTML = `
            <h3>Novo Curso</h3>
            <input type="text" id="course-name" placeholder="Nome do Curso" required />
            <input type="text" id="course-code" placeholder="Código (Ex: CC001)" required />
            <textarea id="course-description" placeholder="Descrição"></textarea>
            <div class="botoesForm">
                <button type="submit">Salvar Curso</button>
                <button type="button" id="cancelar-curso">Cancelar</button>
            </div>
        `;

        topBar.appendChild(form);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = form.querySelector("#course-name").value.trim();
            const code = form.querySelector("#course-code").value.trim();
            const description = form.querySelector("#course-description").value.trim();

            try {
                // Rotas do backend (TS): POST /api/course
                const res = await fetch(`${API_URL}/api/course`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, code, description /* adicione institutionId se necessário */ })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Erro ao criar curso");

                alert("Curso criado com sucesso!");
                form.remove();
                carregarCursos(); // Recarrega a lista

            } catch (err) {
                alert(`Erro ao criar curso: ${err.message}`);
            }
        });

        form.querySelector("#cancelar-curso").addEventListener("click", () => form.remove());
    });
}

// Editar curso (PUT)
async function editarCurso(curso) {
    const novoNome = prompt("Novo nome:", curso.name);
    const novoCodigo = prompt("Novo código:", curso.code);
    
    if (!novoNome || !novoCodigo) return;

    try {
        // Rotas do backend (TS): PUT /api/course (ID DEVE IR NO BODY)
        const res = await fetch(`${API_URL}/api/course`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            // Enviando ID no corpo, conforme a rota PUT /api/course
            body: JSON.stringify({ 
                id: curso.id, 
                name: novoNome, 
                code: novoCodigo,
                description: curso.description // Mantém a descrição, se houver
            })
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Erro ao editar curso");

        alert("Curso atualizado!");
        carregarCursos();

    } catch (err) {
        alert(`Erro ao editar curso: ${err.message}`);
    }
}

// Excluir curso (DELETE)
async function excluirCurso(id) {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
        // Rota assumida: DELETE /api/course/:id
        const res = await fetch(`${API_URL}/api/course/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) throw new Error("Erro ao excluir curso");
        alert("Curso removido com sucesso!");
        carregarCursos();

    } catch (err) {
        alert(`Erro ao excluir curso: ${err.message}`);
    }
}


// --- CONFIGURAÇÃO DE FILTRO ---

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


// --- INICIALIZAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtém as referências aos elementos do DOM
    topBar = document.querySelector(".topBar");
    inputPesquisaCurso = document.querySelector("#pesqCurso");
    
    // O HTML tem dois elementos com id="btnAddInstituicao". Pegamos o que está DENTRO de .topBar:
    btnAddCurso = topBar ? topBar.querySelector("#btnAddInstituicao") : null; 

    if (!topBar) {
        console.error("Não foi possível encontrar o elemento .topBar. O script de curso não pode ser executado.");
        return;
    }

    // 2. Configura os listeners de eventos
    setupAdicionarCurso();
    setupFiltroCursos();

    // 3. Carrega os dados iniciais (Cursos)
    carregarCursos();
});