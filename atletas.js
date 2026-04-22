import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');
const tituloForm = document.getElementById('titulo-form');
const botoesSalvar = document.getElementById('botoes-salvar');
const botoesEdicao = document.getElementById('botoes-edicao');

// Função para preencher os campos e ativar os botões de edição
function ativarModoEdicao(atleta, id) {
    tituloForm.innerText = "EDITAR ATLETA: " + atleta.nome.toUpperCase();
    botoesSalvar.style.display = 'none';
    botoesEdicao.style.display = 'flex';

    // Preenche os inputs
    document.getElementById('atleta-id').value = id;
    document.getElementById('nome').value = atleta.nome;
    document.getElementById('data_nasc').value = atleta.data_nascimento || "";
    document.getElementById('nacionalidade').value = atleta.nacionalidade || "";
    document.getElementById('naturalidade').value = atleta.naturalidade || "";
    document.getElementById('doc_id').value = atleta.documento_id || "";
    document.getElementById('val_id').value = atleta.validade_id || "";
    document.getElementById('nif').value = atleta.nif || "";
    document.getElementById('utente').value = atleta.numero_utente || "";
    document.getElementById('nome_pai').value = atleta.nome_pai || "";
    document.getElementById('nome_mae').value = atleta.nome_mae || "";
    document.getElementById('tel').value = atleta.telefone || "";
    document.getElementById('morada').value = atleta.morada || "";
    document.getElementById('atleta-escalao').value = atleta.escalao || "";
    document.getElementById('isento').value = atleta.isento || "Não";
    document.getElementById('licenca').value = atleta.licenca_fpv || "";
    
    // Rola para o topo para veres que entrou em modo edição
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Inicialização: Carrega escalões e verifica URL para Edição
async function inicializar() {
    // Carregar Escalões no Select
    const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
    const snap = await getDocs(q);
    selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
    snap.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.data().nome;
        opt.textContent = d.data().nome;
        selectEscalao.appendChild(opt);
    });

    // VERIFICAÇÃO CRÍTICA: Se vier da lista com ?edit=ID na URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        try {
            const docRef = doc(db, "atletas", editId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                ativarModoEdicao(docSnap.data(), editId);
            }
        } catch (e) {
            console.error("Erro ao buscar atleta para edição:", e);
        }
    }
}

// 2. Botão Atualizar (UPDATE)
document.getElementById('btn-atualizar').onclick = async () => {
    const id = document.getElementById('atleta-id').value;
    if (!id) return;

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
        window.location.href = 'lista-atletas.html';
    } catch (e) { alert("Erro ao atualizar."); }
};

// 3. Botão Cancelar
document.getElementById('btn-cancelar').onclick = () => {
    window.location.href = 'lista-atletas.html';
};

// 4. Gravar Novo (CREATE)
formAtleta.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Se estiver em modo edição (ID preenchido), não faz nada aqui
    if (document.getElementById('atleta-id').value) return;

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
        alert("Atleta registada com sucesso!");
        formAtleta.reset();
    } catch (e) { alert("Erro ao gravar."); }
});

// Executa a inicialização ao abrir
inicializar();
