import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');
const btnSubmit = document.getElementById('btn-submit');
const botoesSalvar = document.getElementById('botoes-salvar');
const botoesEdicao = document.getElementById('botoes-edicao');
const tituloForm = document.getElementById('titulo-form');

// Carregar Escalões
async function carregarEscaloes() {
    const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
    const querySnapshot = await getDocs(q);
    selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
    querySnapshot.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.data().nome;
        opt.textContent = d.data().nome;
        selectEscalao.appendChild(opt);
    });
    // Verifica se há edição pendente APÓS carregar escalões
    verificarEdicao();
}

function verificarEdicao() {
    const atletaParaEditar = JSON.parse(localStorage.getItem('editandoAtleta'));
    if (atletaParaEditar) {
        tituloForm.innerText = "Editar Atleta: " + atletaParaEditar.nome;
        document.getElementById('atleta-id').value = atletaParaEditar.id;
        document.getElementById('nome').value = atletaParaEditar.nome;
        document.getElementById('data_nasc').value = atletaParaEditar.data_nascimento;
        document.getElementById('nacionalidade').value = atletaParaEditar.nacionalidade || "";
        document.getElementById('naturalidade').value = atletaParaEditar.naturalidade || "";
        document.getElementById('doc_id').value = atletaParaEditar.documento_id || "";
        document.getElementById('val_id').value = atletaParaEditar.validate_id || ""; // Ajustado para match com HTML
        document.getElementById('nif').value = atletaParaEditar.nif || "";
        document.getElementById('utente').value = atletaParaEditar.numero_utente || "";
        document.getElementById('nome_pai').value = atletaParaEditar.nome_pai || "";
        document.getElementById('nome_mae').value = atletaParaEditar.nome_mae || "";
        document.getElementById('tel').value = atletaParaEditar.telefone;
        document.getElementById('morada').value = atletaParaEditar.morada || "";
        document.getElementById('atleta-escalao').value = atletaParaEditar.escalao;
        document.getElementById('isento').value = atletaParaEditar.isento;
        document.getElementById('licenca').value = atletaParaEditar.licenca_fpv || "";

        botoesSalvar.style.display = 'none';
        botoesEdicao.style.display = 'flex';
    }
}

// Botão Cancelar
document.getElementById('btn-cancelar').onclick = () => {
    localStorage.removeItem('editandoAtleta');
    window.location.href = 'lista-atletas.html';
};

// Botão Atualizar (EDITAR)
document.getElementById('btn-atualizar').onclick = async () => {
    const id = document.getElementById('atleta-id').value;
    const atletaRef = doc(db, "atletas", id);
    
    const dadosAtualizados = {
        nome: document.getElementById('nome').value,
        data_nascimento: document.getElementById('data_nasc').value,
        nacionalidade: document.getElementById('nacionalidade').value,
        naturalidade: document.getElementById('naturalidade').value,
        documento_id: document.getElementById('doc_id').value,
        validade_id: document.getElementById('val_id').value,
        nif: document.getElementById('nif').value,
        numero_utente: document.getElementById('utente').value,
        nome_pai: document.getElementById('nome_pai').value,
        nome_mae: document.getElementById('nome_mae').value,
        telefone: document.getElementById('tel').value,
        morada: document.getElementById('morada').value,
        escalao: document.getElementById('atleta-escalao').value,
        isento: document.getElementById('isento').value,
        licenca_fpv: document.getElementById('licenca').value
    };

    try {
        await updateDoc(atletaRef, dadosAtualizados);
        alert("Dados atualizados com sucesso!");
        localStorage.removeItem('editandoAtleta');
        window.location.href = 'lista-atletas.html';
    } catch (e) {
        alert("Erro ao atualizar.");
    }
};

// Gravar Novo Atleta
formAtleta.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (localStorage.getItem('editandoAtleta')) return; // Evita duplicar se estiver editando

    const novaAtleta = {
        nome: document.getElementById('nome').value,
        data_nascimento: document.getElementById('data_nasc').value,
        nacionalidade: document.getElementById('nacionalidade').value,
        naturalidade: document.getElementById('naturalidade').value,
        documento_id: document.getElementById('doc_id').value,
        validade_id: document.getElementById('val_id').value,
        nif: document.getElementById('nif').value,
        numero_utente: document.getElementById('utente').value,
        nome_pai: document.getElementById('nome_pai').value,
        nome_mae: document.getElementById('nome_mae').value,
        telefone: document.getElementById('tel').value,
        morada: document.getElementById('morada').value,
        escalao: document.getElementById('atleta-escalao').value,
        isento: document.getElementById('isento').value,
        licenca_fpv: document.getElementById('licenca').value,
        status_pagamento: false,
        data_cadastro: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "atletas"), novaAtleta);
        alert("Atleta gravada!");
        formAtleta.reset();
    } catch (error) { alert("Erro ao gravar."); }
});

carregarEscaloes();
