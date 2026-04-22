import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');

/**
 * 1. CARREGAR ESCALÕES DINÂMICOS
 * Esta função garante que o menu de seleção do escalão mostre 
 * exatamente os grupos que tu criaste na aba de Treinadores.
 */
async function carregarEscaloesParaSelecao() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const querySnapshot = await getDocs(q);
        
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
        if (selectEscalao) {
            selectEscalao.innerHTML = '<option value="">Erro ao carregar escalões</option>';
        }
    }
}

/**
 * 2. GRAVAR INSCRIÇÃO FEDERADA
 * Captura todos os campos do formulário e guarda na coleção "atletas".
 */
if (formAtleta) {
    formAtleta.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Criando o objeto com todos os campos da ficha federada
        const novaAtleta = {
            // 1. Identificação
            nome: document.getElementById('nome').value,
            data_nascimento: document.getElementById('data_nasc').value,
            nacionalidade: document.getElementById('nacionalidade').value,
            naturalidade: document.getElementById('naturalidade').value,
            
            // 2. Documentação e Saúde
            documento_id: document.getElementById('doc_id').value,
            validade_id: document.getElementById('val_id').value,
            nif: document.getElementById('nif').value,
            numero_utente: document.getElementById('utente').value,
            
            // 3. Filiação e Contactos
            nome_pai: document.getElementById('nome_pai').value,
            nome_mae: document.getElementById('nome_mae').value,
            telefone: document.getElementById('tel').value,
            morada: document.getElementById('morada').value,
            
            // 4. Vínculo ao Clube
            escalao: document.getElementById('atleta-escalao').value,
            isento: document.getElementById('isento').value, // Salva como "true" ou "false" (string)
            licenca_fpv: document.getElementById('licenca').value,
            
            // Controle de Sistema
            status_pagamento: false, // Inicia como não pago no mês atual
            data_cadastro: new Date().toISOString()
        };

        try {
            // Envia para a coleção "atletas" no Firestore
            await addDoc(collection(db, "atletas"), novaAtleta);
            
            alert("Inscrição de " + novaAtleta.nome + " gravada com sucesso!");
            
            // Limpa o formulário para a próxima atleta
            formAtleta.reset();
            
        } catch (error) {
            console.error("Erro ao salvar atleta:", error);
            alert("Ocorreu um erro ao gravar. Por favor, verifique a ligação ou a consola.");
        }
    });
}

/**
 * INICIALIZAÇÃO
 */
carregarEscaloesParaSelecao();
