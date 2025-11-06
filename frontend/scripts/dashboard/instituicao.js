// murilo
import { GetAuthHeaders } from "scripts/utils/getAuthHeaders.js";
import { API_URL } from "../utils/config.js";

let instituicoes = [];
let sideBar;
let btnAddInstituicao;
let inputPesquisa;

async function carregarInstituicoes() {
    try {
        const res = await fetch(`${API_URL}/api/institution/all`, {
            method: "GET",
            headers: GetAuthHeaders()
        });

        const body = await res.json();
        instituicoes = Array.isArray(body.data) ? body.data : [];
        renderizarInstituicoes(instituicoes);

    } catch (err) {
        console.error("Falha ao carregar instituições:", err);
        if (err.message !== "Usuário não autenticado") {
            alert(`Erro: ${err.message}`);
        }
    }
}

async function criarInstituicao(novaInst) {
    try {
        const res = await fetch(`${API_URL}/api/institution`, {
            method: "POST",
            headers: GetAuthHeaders(),
            body: JSON.stringify(novaInst)
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Erro ao criar instituição");

        alert("Instituição criada com sucesso!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

async function atualizarInstituicao(id, dadosAtualizados) {
    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: "PUT",
            headers: GetAuthHeaders(),
            body: JSON.stringify(dadosAtualizados)
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Erro ao editar instituição");

        alert("Instituição atualizada!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

async function excluirInstituicao(id) {
    if (!confirm("Tem certeza que deseja excluir esta instituição? A ação não pode ser desfeita.")) return;

    try {
        const res = await fetch(`${API_URL}/api/institution/${id}`, {
            method: "DELETE",
            headers: GetAuthHeaders()
        });

        if (res.status !== 204 && !res.ok) throw new Error("Erro ao excluir instituição");
        alert("Instituição removida com sucesso!");
        carregarInstituicoes();

    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

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

        const nomeSpan = document.createElement("span");
        nomeSpan.textContent = inst.name;

        // Botão Selecionar
        const btnSelecionar = document.createElement("button");
        btnSelecionar.textContent = "Selecionar";
        btnSelecionar.classList.add("btn-selecionar");
        btnSelecionar.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".item-instituicao.selecionada").forEach(el => el.classList.remove("selecionada"));
            li.classList.add("selecionada");
            window.dispatchEvent(new CustomEvent("instituicaoSelecionada", { detail: { id: inst.id } }));
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

        acoesDiv.appendChild(btnSelecionar);
        acoesDiv.appendChild(btnEditar);
        acoesDiv.appendChild(btnExcluir);
        li.appendChild(nomeSpan);
        li.appendChild(acoesDiv);
        listaUL.appendChild(li);
    });

    sideBar.appendChild(listaUL);
}

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

document.addEventListener("DOMContentLoaded", () => {
    sideBar = document.querySelector(".sideBar");
    btnAddInstituicao = document.querySelector("#btnAddInstituicao");
    inputPesquisa = document.querySelector("#pesqInt");

    if (!sideBar) {
        console.error("Elemento .sideBar não encontrado. O script não pode ser executado.");
        return;
    }

    setupAdicionarInstituicao();
    setupFiltro();
    carregarInstituicoes();

    const btnContinuar = document.getElementById("btnContinuar");
    btnContinuar?.addEventListener("click", async () => {
        const professorId = localStorage.getItem("userId"); 
        // Pegue a instituição selecionada
        const selecionada = document.querySelector(".selecionada");
        const institutionId = selecionada?.dataset.id;

        if (!professorId || !institutionId) {
            alert("Selecione uma instituição antes de continuar.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/institution/relateWithProfessor`, {
                method: "POST",
                headers: GetAuthHeaders(),
                body: JSON.stringify({
                    professorId,
                    institutionId
                })
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Erro ao relacionar professor com instituição.");
            alert("Relacionamento realizado com sucesso!");
            window.location.href = '/frontend/pages/conta/painelPrincipal.html'
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    });
});