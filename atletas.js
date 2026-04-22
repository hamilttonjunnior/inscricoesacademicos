import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Referências dos elementos do HTML
const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');
const tituloForm = document.getElementById('titulo-form');
const atletaIdOculto = document.getElementById('atleta-id');

const botoesSalvar = document.getElementById('botoes-salvar');
const botoesEdicao = document.getElementById('botoes-edicao');
const btnAtualizar = document.getElementById('btn-atualizar');
const btnCancelar = document.getElementById('btn-cancelar');

/**
 * 1. CARREGAR ESCALÕES
 * Busca os escalões no Firebase para preencher o Select
 */
async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const querySnapshot = await getDocs(q);
        
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        querySnapshot.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.data().nome;
            opt.textContent = d.data().nome;
            selectEscalao.appendChild(opt);
        });

        // Só verifica a edição DEPOIS de carregar os escalões para o Select não ficar vazio
        verificarModoEdicao();
    } catch (e) {
        console.error("Erro ao carregar escalões:", e);
    }
}

/**
 * 2. VERIFICAR MODO EDIÇÃO
 * Vê se existe uma atleta guardada no localStorage para editar
 */
function verificarModoEdicao() {
    const atletaParaEditar = JSON.parse(localStorage.getItem('editandoAtleta'));

    if (atletaParaEditar) {
        // Muda o visual para Modo Edição
        tituloForm.innerText = "Editar Atleta: " + atletaParaEditar.nome;
        botoesSalvar.style.display = 'none';
        botoesEdicao.style.display = 'flex';

        // Preenche todos os campos com os dados existentes
        atletaIdOculto.value = atletaParaEditar.id;
        document.getElementById('nome').value = atletaParaEditar.nome;
        document.getElementById('data_nasc').value = atletaParaEditar.data_nascimento;
        document.getElementById('nacionalidade').value = atletaParaEditar.nacionalidade || "";
        document.getElementById('naturalidade').value = atletaParaEditar.naturalidade || "";
        document.getElementById('doc_id').value = atletaParaEditar.documento_id || "";
        document.getElementById('val_id').value = atletaParaEditar.validade_id || "";
        document.getElementById('nif').value = atletaParaEditar.nif || "";
        document.getElementById('utente').value = atletaParaEditar.numero_utente || "";
        document.getElementById('nome_pai').value = atletaParaEditar.nome_pai || "";
        document.getElementById('nome_mae').value = atletaParaEditar.nome_mae || "";
        document.getElementById('tel').value = atletaParaEditar.telefone;
        document.getElementById('morada').value = atletaParaEditar.morada || "";
        document.getElementById('atleta-escalao').value = atletaParaEditar.escalao;
        document.getElementById('isento').value = atletaParaEditar.isento;
        document.getElementById('licenca').value = atletaParaEditar.licenca_fpv || "";
    }
}

/**
 * 3. LÓGICA DO BOTÃO CANCELAR
 */
if (btnCancelar) {
    btnCancelar.onclick = () => {
        localStorage.removeItem('editandoAtleta');
        window.location.href = 'lista-atletas.html';
    };
}

/**
 * 4. LÓGICA DO BOTÃO ATUALIZAR (UPDATE)
 */
if (btnAtualizar) {
    btnAtualizar.onclick = async () => {
        const id = atletaIdOculto.value;
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
            alert("Dados da atleta " + dadosAtualizados.nome + " atualizados com sucesso!");
            localStorage.removeItem('editandoAtleta');
            window.location.href = 'lista-atletas.html';
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao atualizar os dados.");
        }
    };
}

/**
 * 5. GRAVAR NOVA INSCRIÇÃO (CREATE)
 */
formAtleta.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Se estiver em modo edição, o submit normal do formulário é ignorado 
    // (quem manda é o botão Atualizar acima)
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
        alert("Inscrição de " + novaAtleta.nome + " gravada com sucesso!");
        formAtleta.reset();
    } catch (error) {
        console.error("Erro ao gravar:", error);
        alert("Erro ao gravar nova atleta.");
    }
});

// Inicialização
carregarEscaloes();
