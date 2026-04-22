// atletas.js
import { db } from './database.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');

/**
 * 1. CARREGAR ESCALÕES NO FORMULÁRIO
 * Busca os escalões criados na página de treinadores para preencher o menu.
 */
async function carregarEscaloesParaSelecao() {
    try {
        const querySnapshot = await getDocs(collection(db, "escaloes"));
        
        if (selectEscalao) {
            selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
            querySnapshot.forEach(doc => {
                const opt = document.createElement('option');
                opt.value = doc.data().nome;
                opt.textContent = doc.data().nome;
                selectEscalao.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Erro ao buscar escalões:", e);
    }
}

/**
 * 2. SALVAR ATLETA COM TODOS OS DADOS FEDERADOS
 */
if (formAtleta) {
    formAtleta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novaAtleta = {
            // Identificação
            nome: document.getElementById('nome').value,
            data_nascimento: document.getElementById('data_nasc').value,
            nacionalidade: document.getElementById('nacionalidade').value,
            naturalidade: document.getElementById('naturalidade').value,
            
            // Documentação e Saúde
            documento_id: document.getElementById('doc_id').value,
            validade_id: document.getElementById('val_id').value,
            nif: document.getElementById('nif').value,
            numero_utente: document.getElementById('utente').value,
            
            // Família e Contactos
            nome_pai: document.getElementById('nome_pai').value,
            nome_mae: document.getElementById('nome_mae').value,
            telefone: document.getElementById('tel').value,
            morada: document.getElementById('morada').value,
            cod_postal: document.getElementById('cod_postal').value,
            
            // Desportivo e Financeiro
            escalao: document.getElementById('atleta-escalao').value,
            licenca_fpv: document.getElementById('licenca').value,
            desporto_escolar: document.getElementById('desporto_escolar').value,
            isento: document.getElementById('isento').value, 
            profissao: document.getElementById('profissao').value,
            
            // Controle Interno
            status_pagamento: false, 
            faltas: 0,
            data_cadastro: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "atletas"), novaAtleta);
            alert("Sucesso! Atleta " + novaAtleta.nome + " foi registada.");
            formAtleta.reset();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao gravar. Verifique a consola.");
        }
    });
}

// Inicialização
carregarEscaloesParaSelecao();
