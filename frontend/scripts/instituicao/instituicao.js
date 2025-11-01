// murilo
import { API_URL } from "../utils/config.js";

// Variáveis globais para os dados e elementos do DOM
let instituicoes = [];
let sideBar;
let btnAddInstituicao;
let inputPesquisa;

// Função principal de carregamento de dados
async function carregarInstituicoes() {
    try {
        console.log("Iniciando carregamento de instituições...");
        // Faz a requisição GET para buscar todas as instituições
        const res = await fetch(`${API_URL}/api/institution/all`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const body = await res.json();

        if (res.status !== 200) {
            throw new Error(body.message || `Erro ao buscar instituições. Código: ${res.status}`);
        }

        console.log("Instituições carregadas:", body);

        // 1. **ATUALIZA A VARIÁVEL GLOBAL** com os dados do backend
        // (Assumindo que o backend retorna um array de objetos)
        instituicoes = Array.isArray(body) ? body : [];

        // 2. Chama a função de renderização
        renderizarInstituicoes(instituicoes);

    } catch (err) {
        console.error("Erro ao carregar instituições:", err);
        alert("Erro ao carregar instituições. Tente novamente mais tarde.");
    }
}


// Função para renderizar a lista na tela
// AQUI: Assumindo que a API retorna objetos com propriedades 'id', 'name', 'city', 'state'
function renderizarInstituicoes(lista) {
    // Garante que o sideBar está disponível
    if (!sideBar) {
        console.error("Elemento .sideBar não encontrado.");
        return;
    }

    // Remove listas anteriores
    let listaExistente = sideBar.querySelector(".lista-instituicoes");
    if (listaExistente) listaExistente.remove();

    // Remove mensagem de "vazio" anterior (se houver)
    let msgVazio = sideBar.querySelector(".msg-vazio");
    if (msgVazio) msgVazio.remove();

    const listaUL = document.createElement("ul");
    listaUL.classList.add("lista-instituicoes");

    if (lista.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = inputPesquisa && inputPesquisa.value.length > 0
            ? "Nenhuma instituição encontrada com este termo."
            : "Nenhuma instituição cadastrada.";
        vazio.classList.add("msg-vazio");
        sideBar.appendChild(vazio);
        return;
    }

    lista.forEach(inst => {
        const li = document.createElement("li");
        li.classList.add("item-instituicao");
        // **USANDO AS PROPRIEDADES CORRETAS DA API** (Ajuste se necessário)
        const nomeTexto = inst.name
            ? `${inst.name} - ${inst.city || ''}/${inst.state || ''}`
            : `Instituição #${inst.id}`;

        const nome = document.createElement("span");
        nome.textContent = nomeTexto;
        nome.addEventListener("click", () => { // Adicionando o listener de clique para seleção
            console.log(`Selecionada: ${inst.name} (ID: ${inst.id})`);
            // Lógica de seleção (exemplo: remove de todos e adiciona no atual)
            document.querySelectorAll(".item-instituicao.selecionada").forEach(el => el.classList.remove("selecionada"));
            li.classList.add("selecionada");
        });

        const botoes = document.createElement("div");
        botoes.classList.add("acoes");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");
        // OBS: As funções editar/excluir foram corrigidas para usar as propriedades corretas da API (id, name, city, state)
        btnEditar.addEventListener("click", (e) => {
             e.stopPropagation(); // Previne o clique de seleção
             editarInstituicao(inst);
        });

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.classList.add("btn-excluir");
        btnExcluir.addEventListener("click", (e) => {
             e.stopPropagation(); // Previne o clique de seleção
             excluirInstituicao(inst.id);
        });

        botoes.appendChild(btnEditar);
        botoes.appendChild(btnExcluir);

        li.appendChild(nome);
        li.appendChild(botoes);
        listaUL.appendChild(li);
    });

    sideBar.appendChild(listaUL);
}

// ... Resto das funções (editarInstituicao, excluirInstituicao, lógica de criação) ...

// **Função Editar Instituição (Ajustada para a API)**
async function editarInstituicao(inst) {
    // Usando as propriedades da API (name, city, state)
    const novoNome = prompt("Novo nome:", inst.name);
    const novaCidade = prompt("Nova cidade:", inst.city);
    const novoEstado = prompt("Novo estado:", inst.state);

    if (!novoNome || !novaCidade || !novoEstado) return;

    try {
        const res = await fetch(`${API_URL}/api/institution/${inst.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            // Enviando as propriedades corretas (name, city, state)
            body: JSON.stringify({ name: novoNome, city: novaCidade, state: novoEstado })
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Erro ao editar instituição");

        alert("Instituição atualizada!");
        carregarInstituicoes(); // Recarrega a lista

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

// **Função Excluir Instituição**
async function excluirInstituicao(id) {
    if (!confirm("Tem certeza que deseja excluir esta instituição?")) return;

    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) throw new Error("Erro ao excluir instituição");
        alert("Instituição removida com sucesso!");
        carregarInstituicoes(); // Recarrega a lista

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}


// **Criação de nova instituição (Ajustada para a API)**
function setupAdicionarInstituicao() {
    if (!btnAddInstituicao) return;

    btnAddInstituicao.addEventListener("click", () => {
        if (document.querySelector("#formNovaInst")) return;

        const form = document.createElement("form");
        form.id = "formNovaInst";
        form.innerHTML = `
            <h3>Nova Instituição</h3>
            <input type="text" id="name" placeholder="Nome" required />
            <input type="text" id="city" placeholder="Cidade" required />
            <input type="text" id="state" placeholder="Estado" required />
            <div class="botoesForm">
                <button type="submit">Salvar</button>
                <button type="button" id="cancelar">Cancelar</button>
            </div>
        `;

        sideBar.appendChild(form);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            // **USANDO OS IDs e propriedades corretas da API**
            const nome = form.querySelector("#name").value.trim();
            const cidade = form.querySelector("#city").value.trim();
            const estado = form.querySelector("#state").value.trim();

            try {
                const res = await fetch(`${API_URL}/api/institution`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    // Enviando as propriedades corretas (name, city, state)
                    body: JSON.stringify({ name: nome, city: cidade, state: estado })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Erro ao criar instituição");

                alert("Instituição criada com sucesso!");
                form.remove();
                carregarInstituicoes(); // Recarrega a lista

            } catch (err) {
                alert(`Erro: ${err.message}`);
            }
        });

        form.querySelector("#cancelar").addEventListener("click", () => form.remove());
    });
}

// **Filtro de pesquisa (Ajustado para a API)**
function setupFiltro() {
    if (!inputPesquisa) return;

    inputPesquisa.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        // **FILTRANDO PELA PROPRIEDADE CORRETA DA API (name)**
        const filtradas = instituicoes.filter(i => (i.name || "").toLowerCase().includes(termo));
        renderizarInstituicoes(filtradas);
    });
}


// Evento que inicializa tudo após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtém as referências aos elementos do DOM
    sideBar = document.querySelector(".sideBar");
    btnAddInstituicao = document.querySelector("#btnAddInstituicao"); // Assumindo o ID/classe do botão
    inputPesquisa = document.querySelector("#inputPesquisa"); // Assumindo o ID/classe do campo de busca

    if (!sideBar) {
        console.error("Não foi possível encontrar o elemento .sideBar. O script não pode ser executado.");
        return;
    }

    // 2. Configura os listeners de eventos
    setupAdicionarInstituicao();
    setupFiltro();

    // 3. Carrega os dados iniciais
    carregarInstituicoes();
});