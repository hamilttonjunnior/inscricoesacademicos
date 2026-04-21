// atletas.js
import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('form-atleta');
const listaCards = document.getElementById('lista-cards');
const selectEscalao = document.getElementById('escalao');

/**
 * 1. CARREGAR ESCALÕES DINÂMICOS
 * Busca os escalões que você criou na página de treinadores e coloca no formulário
 */
async function carregarEscaloesParaSelecao() {
    try {
        const querySnapshot = await getDocs(collection(db, "escaloes"));
        // Limpa o select e adiciona a opção padrão
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        querySnapshot.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.data().nome;
            opt.textContent = doc.data().nome;
            selectEscalao.appendChild(opt);
        });
    } catch (e) {
        console.error("Erro ao buscar escalões:", e);
        selectEscalao.innerHTML = '<option value="">Erro ao carregar escalões</option>';
    }
}

/**
 * 2. SALVAR NOVA ATLETA
 * Pega todos os campos da ficha de inscrição e envia para o Firestore
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Criamos o objeto com TODOS os dados que você listou
    const dadosAtleta = {
        nome: document.getElementById('nome').value,
        data_nascimento: document.getElementById('data_nascimento').value,
        nacionalidade: document.getElementById('nacionalidade').value,
        naturalidade: document.getElementById('naturalidade').value,
        documento_id: document.getElementById('documento_id').value,
        validade_id: document.getElementById('validade_id').value,
        nif: document.getElementById('nif').value,
        numero_utente: document.getElementById('numero_utente').value,
        nome_pai: document.getElementById('nome_pai').value,
        nome_mae: document.getElementById('nome_mae').value,
        telefone: document.getElementById('telefone').value,
        morada: document.getElementById('morada').value,
        cod_postal: document.getElementById('cod_postal').value,
        escalao: document.getElementById('escalao').value,
        licenca_fpv: document.getElementById('licenca_fpv').value,
        compromisso_escolar: document.getElementById('compromisso_escolar').value,
        profissao: document.getElementById('profissao').value,
        // Campos de controle interno do sistema
        status_pagamento: false, 
        faltas: 0,
        data_cadastro: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "atletas"), dadosAtleta);
        alert("Inscrição de " + dadosAtleta.nome + " realizada com sucesso!");
        form.reset();
        carregarAtletas(); // Atualiza a lista abaixo
    } catch (error) {
        console.error("Erro ao gravar atleta:", error);
        alert("Erro ao gravar. Verifique o console ou as regras do Firebase.");
    }
});

/**
 * 3. LISTAR ATLETAS
 * Mostra as atletas cadastradas em cartões logo abaixo do formulário
 */
async function carregarAtletas() {
    listaCards.innerHTML = "<p>A carregar lista de atletas...</p>";
    
    try {
        // Busca atletas ordenadas por nome de A a Z
        const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapshot = await getDocs(q);
        
        listaCards.innerHTML = ""; // Limpa o texto de carregamento

        if (snapshot.empty) {
            listaCards.innerHTML = "<p>Nenhuma atleta cadastrada.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const a = doc.data();
            const card = document.createElement('div');
            card.className = 'card-atleta';
            
            // Criamos o visual do card (você pode adicionar mais campos se quiser)
            card.innerHTML = `
                <h3>${a.nome}</h3>
                <p><strong>Escalão:</strong> ${a.escalao}</p>
                <p><strong>Telemóvel:</strong> ${a.telefone}</p>
                <p><strong>NIF:</strong> ${a.nif || 'Não informado'}</p>
                <small>Inscrita em: ${new Date(a.data_cadastro).toLocaleDateString()}</small>
            `;
            listaCards.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao listar atletas:", err);
        listaCards.innerHTML = "<p>Erro ao carregar a lista.</p>";
    }
}

// INICIALIZAÇÃO DA PÁGINA
carregarEscaloesParaSelecao();
carregarAtletas();
