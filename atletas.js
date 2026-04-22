import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');
const tituloForm = document.getElementById('titulo-form');
const btnGravar = document.getElementById('btn-gravar');
const botoesSalvar = document.getElementById('botoes-salvar');
const botoesEdicao = document.getElementById('botoes-edicao');

// 1. Inicialização: Carrega escalões e verifica se é Edição
async function inicializar() {
    // Carregar Escalões
    const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
    const snap = await getDocs(q);
    selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
    snap.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.data().nome;
        opt.textContent = d.data().nome;
        selectEscalao.appendChild(opt);
    });

    // Verificar se existe atleta para editar
    const dadosEdicao = localStorage.getItem('editandoAtleta');
    if (dadosEdicao) {
        const atleta = JSON.parse(dadosEdicao);
        
        // Troca o Título e os Botões
        tituloForm.innerText = "Editar Atleta: " + atleta.nome;
        botoesSalvar.style.display = 'none';
        botoesEdicao.style.display = 'flex';

        // Preenche os Campos
        document.getElementById('atleta-id').value = atleta.id;
        document.getElementById('nome').value = atleta.nome;
        document.getElementById('data_nasc').value = atleta.data_nascimento;
        document.getElementById('nacionalidade').value = atleta.nacionalidade || "";
        document.getElementById('naturalidade').value = atleta.naturalidade || "";
        document.getElementById('doc_id').value = atleta.documento_id || "";
        document.getElementById('val_id').value = atleta.validade_id || "";
        document.getElementById('nif').value = atleta.nif || "";
        document.getElementById('utente').value = atleta.numero_utente || "";
        document.getElementById('nome_pai').value = atleta.nome_pai || "";
        document.getElementById('nome_mae').value = atleta.nome_mae || "";
        document.getElementById('tel').value = atleta.telefone;
        document.getElementById('morada').value = atleta.morada || "";
        document.getElementById('atleta-escalao').value = atleta.escalao;
        document.getElementById('isento').value = atleta.isento;
        document.getElementById('licenca').value = atleta.licenca_fpv || "";
    }
}

// 2. Botão Atualizar (UPDATE)
document.getElementById('btn-atualizar').onclick = async () => {
    const id = document.getElementById('atleta-id').value;
    const atletaRef = doc(db, "atletas", id);

    const dados = {
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
        await updateDoc(atletaRef, dados);
        alert("Dados de " + dados.nome + " atualizados com sucesso!");
        localStorage.removeItem('editandoAtleta');
        window.location.href = 'lista-atletas.html';
    } catch (e) { alert("Erro ao atualizar."); }
};

// 3. Botão Cancelar
document.getElementById('btn-cancelar').onclick = () => {
    localStorage.removeItem('editandoAtleta');
    window.location.href = 'lista-atletas.html';
};

// 4. Gravar Novo (CREATE)
formAtleta.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (localStorage.getItem('editandoAtleta')) return;

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
        alert("Gravada com sucesso!");
        formAtleta.reset();
    } catch (e) { alert("Erro ao gravar."); }
});

inicializar();
