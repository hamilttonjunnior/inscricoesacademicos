import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');
const listaTreinadoresCards = document.getElementById('lista-treinadores-cards');

// Elementos de Edição
const tituloForm = document.getElementById('titulo-form-treinador');
const btnGravar = document.getElementById('btn-gravar-t');
const botoesEdicao = document.getElementById('botoes-edicao-t');
const treinadorIdOculto = document.getElementById('treinador-id');

const iconeLixeira = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
const iconeEditar = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;

/**
 * 1. CARREGAR ESCALÕES
 */
async function carregarEscaloes() {
    const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
    const snap = await getDocs(q);
    listaPreview.innerHTML = "";
    selectEscalao.innerHTML = '<option value="">Selecione</option>';
    snap.forEach(d => {
        const id = d.id; const nome = d.data().nome;
        const opt = document.createElement('option'); opt.value = nome; opt.textContent = nome;
        selectEscalao.appendChild(opt);

        const tag = document.createElement('div');
        tag.style.cssText = "display:flex; align-items:center; gap:8px; background:#f5f5f7; padding:4px 10px; border-radius:4px; border:1px solid #e5e5e7; font-size:0.7rem; font-weight:700;";
        tag.innerHTML = `<span>${nome}</span>`;
        const btnDel = document.createElement('button');
        btnDel.innerHTML = iconeLixeira; btnDel.style.cssText = "background:transparent; color:#ff3b30; border:none; cursor:pointer; padding:2px;";
        btnDel.onclick = async () => { if(confirm(`Apagar ${nome}?`)) { await deleteDoc(doc(db, "escaloes", id)); carregarEscaloes(); } };
        tag.appendChild(btnDel);
        listaPreview.appendChild(tag);
    });
}

/**
 * 2. CARREGAR E LISTAR TREINADORES (LADO DIREITO)
 */
async function carregarTreinadores() {
    const snap = await getDocs(query(collection(db, "treinadores"), orderBy("nome", "asc")));
    listaTreinadoresCards.innerHTML = "";
    
    snap.forEach(d => {
        const t = d.data();
        const id = d.id;

        const card = document.createElement('div');
        card.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #eee; border-radius:4px; background:#fff;";
        card.innerHTML = `
            <div>
                <strong style="font-size:0.85rem; display:block;">${t.nome}</strong>
                <small style="color:#888;">${t.escalao} | ${t.telefone}</small>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn-edit-t" style="background:#f0f0f0; border:none; padding:6px; border-radius:4px; cursor:pointer;">${iconeEditar}</button>
                <button class="btn-del-t" style="background:#fff0f0; border:none; padding:6px; border-radius:4px; cursor:pointer; color:#ff3b30;">${iconeLixeira}</button>
            </div>
        `;

        // Evento Editar
        card.querySelector('.btn-edit-t').onclick = () => prepararEdicao(id, t);
        
        // Evento Eliminar
        card.querySelector('.btn-del-t').onclick = async () => {
            if(confirm(`Remover ${t.nome}?`)) { await deleteDoc(doc(db, "treinadores", id)); carregarTreinadores(); }
        };

        listaTreinadoresCards.appendChild(card);
    });
}

/**
 * 3. LÓGICA DE EDIÇÃO
 */
function prepararEdicao(id, dados) {
    treinadorIdOculto.value = id;
    document.getElementById('t-nome').value = dados.nome;
    document.getElementById('t-telefone').value = dados.telefone;
    document.getElementById('t-escalao-vinculo').value = dados.escalao;
    document.getElementById('t-licenca').value = dados.licenca || "";

    tituloForm.innerText = "Editar Treinador";
    btnGravar.style.display = 'none';
    botoesEdicao.style.display = 'flex';
}

document.getElementById('btn-cancelar-t').onclick = () => resetarFormulario();

function resetarFormulario() {
    formTreinador.reset();
    treinadorIdOculto.value = "";
    tituloForm.innerText = "Registo de Staff";
    btnGravar.style.display = 'block';
    botoesEdicao.style.display = 'none';
}

document.getElementById('btn-atualizar-t').onclick = async () => {
    const id = treinadorIdOculto.value;
    const ref = doc(db, "treinadores", id);
    const novosDados = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value
    };
    await updateDoc(ref, novosDados);
    alert("Treinador atualizado!");
    resetarFormulario();
    carregarTreinadores();
};

/**
 * 4. GRAVAR NOVO
 */
formTreinador.onsubmit = async (e) => {
    e.preventDefault();
    if (treinadorIdOculto.value) return; // Se tem ID, está em modo edição

    const dados = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value,
        data_registo: new Date().toISOString()
    };
    await addDoc(collection(db, "treinadores"), dados);
    alert("Gravado!");
    formTreinador.reset();
    carregarTreinadores();
};

// Adicionar Escalão
document.getElementById('btn-add-escalao').onclick = async () => {
    const nome = document.getElementById('novo-escalao').value.trim();
    if(nome) { await addDoc(collection(db, "escaloes"), { nome }); document.getElementById('novo-escalao').value = ""; carregarEscaloes(); }
};

// Iniciar
carregarEscaloes();
carregarTreinadores();
