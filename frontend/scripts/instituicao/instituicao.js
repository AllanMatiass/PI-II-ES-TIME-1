// murilo
import { API_URL } from "../utils/config.js";

// --- Variáveis Globais ---
let instituicoes = []; // Cache local da lista de instituições
let sideBar;
let btnAddInstituicao;
let inputPesquisa;

// --- Funções Auxiliares ---

/**
 * Cria e retorna os cabeçalhos padrão para requisições autenticadas.
 * @returns {HeadersInit} Objeto com os cabeçalhos.
 */
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = '/login.html';
        throw new Error("Usuário não autenticado");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// --- Funções de Interação com a API (CRUD) ---

/**
 * Busca todas as instituições da API e atualiza a lista na tela.
 */
async function carregarInstituicoes() {
    try {
        const res = await fetch(`${API_URL}/api/institution/all`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const body = await res.json();
        console.log("Resposta da API:", body); // Ótimo para debugar

        if (!res.ok) {
            throw new Error(body.message || `Erro ${res.status} ao buscar instituições.`);
        }

        // CORREÇÃO: A lista de instituições está dentro de 'body.data'
        instituicoes = Array.isArray(body.data) ? body.data : [];
        renderizarInstituicoes(instituicoes);

    } catch (err) {
        console.error("Falha ao carregar instituições:", err);
        // Evita mostrar o alert se o erro foi por redirecionamento de token
        if (err.message !== "Usuário não autenticado") {
            alert(`Erro: ${err.message}`);
        }
    }
}

/**
 * Envia uma nova instituição para a API.
 * @param {object} novaInst - Objeto com { name, city, state }.
 */
async function criarInstituicao(novaInst) {
    try {
        const res = await fetch(`${API_URL}/api/institution`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(novaInst)
        });

        const body = await res.json();
        if (!res.ok) {
            throw new Error(body.message || "Erro ao criar instituição");
        }

        alert("Instituição criada com sucesso!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

/**
 * Atualiza uma instituição existente na API.
 * @param {string} id - O ID da instituição a ser editada.
 * @param {object} dadosAtualizados - Objeto com { name, city, state }.
 */
async function atualizarInstituicao(id, dadosAtualizados) {
    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosAtualizados)
        });

        const body = await res.json();
        if (!res.ok) {
            throw new Error(body.message || "Erro ao editar instituição");
        }

        alert("Instituição atualizada!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

/**
 * Exclui uma instituição da API.
 * @param {string} id - O ID da instituição a ser excluída.
 */
async function excluirInstituicao(id) {
    if (!confirm("Tem certeza que deseja excluir esta instituição? A ação não pode ser desfeita.")) return;

    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.status !== 204 && !res.ok) {
            throw new Error("Erro ao excluir instituição");
        }
        
        alert("Instituição removida com sucesso!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}


// --- Funções de Manipulação do DOM ---

/**
 * Renderiza a lista de instituições na sidebar.
 * @param {Array} lista - A lista de instituições a ser exibida.
 */
function renderizarInstituicoes(lista) {
    if (!sideBar) return;

    sideBar.querySelector(".lista-instituicoes")?.remove();
    sideBar.querySelector(".msg-vazio")?.remove();

    if (lista.length === 0) {
        const msgVazio = document.createElement("p");
        msgVazio.classList.add("msg-vazio");
        msgVazio.textContent = inputPesquisa?.value.length > 0 ? "Nenhuma instituição encontrada." : "Nenhuma instituição cadastrada.";
        sideBar.appendChild(msgVazio);
        return;
    }

    const listaUL = document.createElement("ul");
    listaUL.classList.add("lista-instituicoes");

    lista.forEach(item => {
        const inst = item.institution; 
        
        const li = document.createElement("li");
        li.classList.add("item-instituicao");
        li.dataset.id = inst.id;

        const nomeTexto = inst.name;
        
        const nomeSpan = document.createElement("span");
        nomeSpan.textContent = nomeTexto;
        nomeSpan.addEventListener("click", () => {
             document.querySelectorAll(".item-instituicao.selecionada").forEach(el => el.classList.remove("selecionada"));
             li.classList.add("selecionada");
        });

        const acoesDiv = document.createElement("div");
        acoesDiv.classList.add("acoes");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");
        btnEditar.addEventListener("click", (e) => {
            e.stopPropagation();
            const novoNome = prompt("Novo nome:", inst.name);
            
            if (novoNome) { 
                atualizarInstituicao(inst.id, { name: novoNome});
            }
        });

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.classList.add("btn-excluir");
        btnExcluir.addEventListener("click", (e) => {
            e.stopPropagation();
            excluirInstituicao(inst.id);
        });

        acoesDiv.appendChild(btnEditar);
        acoesDiv.appendChild(btnExcluir);
        li.appendChild(nomeSpan);
        li.appendChild(acoesDiv);
        listaUL.appendChild(li);
    });

    sideBar.appendChild(listaUL);
}

// --- Funções de Configuração de Eventos (Setup) ---

function setupAdicionarInstituicao() {
    if (!btnAddInstituicao) return;
    btnAddInstituicao.addEventListener("click", () => {
        if (document.querySelector("#formNovaInst")) return;
        const form = document.createElement("form");
        form.id = "formNovaInst";
        form.innerHTML = `
            <h3>Nova Instituição</h3>
            <input type="text" id="name" name="name" placeholder="Nome" required />
            <div class="botoesForm">
                <button type="submit">Salvar</button>
                <button type="button" id="cancelar">Cancelar</button>
            </div>
        `;
        sideBar.appendChild(form);
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const novaInst = {
                name: formData.get("name").trim(),
            };
            await criarInstituicao(novaInst);
            form.remove();
        });
        form.querySelector("#cancelar").addEventListener("click", () => form.remove());
    });
}

/**
 * Configura o filtro de pesquisa.
 */
function setupFiltro() {
    if (!inputPesquisa) return;
    inputPesquisa.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        const filtradas = instituicoes.filter(item => 
            (item.institution.name || "").toLowerCase().includes(termo)
        );
        renderizarInstituicoes(filtradas);
    });
}

// --- Ponto de Entrada Principal ---

document.addEventListener("DOMContentLoaded", () => {
    sideBar = document.querySelector(".sideBar");
    btnAddInstituicao = document.querySelector("#btnAddInstituicao");
    inputPesquisa = document.querySelector("#inputPesquisa");

    if (!sideBar) {
        console.error("Elemento .sideBar não encontrado. O script não pode ser executado.");
        return;
    }

    setupAdicionarInstituicao();
    setupFiltro();
    carregarInstituicoes();
});