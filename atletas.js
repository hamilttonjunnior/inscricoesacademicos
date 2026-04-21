import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('form-atleta');
const listaCards = document.getElementById('lista-cards');

// Lógica para Salvar
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
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
        status_pagamento: false,
        faltas: 0,
        data_cadastro: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "atletas"), dados);
        alert("Atleta " + dados.nome + " gravada com sucesso!");
        form.reset();
        carregarAtletas();
    } catch (error) {
        alert("Erro ao gravar. Verifique se as regras do Firebase foram publicadas.");
        console.error(error);
    }
});

// Lógica para Listar
async function carregarAtletas() {
    listaCards.innerHTML = "A carregar...";
    try {
        const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapshot = await getDocs(q);
        listaCards.innerHTML = "";
        
        snapshot.forEach(doc => {
            const a = doc.data();
            const card = document.createElement('div');
            card.className = 'card-atleta';
            card.innerHTML = `
                <h3>${a.nome}</h3>
                <p><strong>Escalão:</strong> ${a.escalao}</p>
                <p><strong>Telemóvel:</strong> ${a.telefone}</p>
            `;
            listaCards.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao carregar:", err);
        listaCards.innerHTML = "Erro ao carregar dados.";
    }
}

carregarAtletas();

async function carregarEscaloesNoSelect() {
    const select = document.getElementById('escalao');
    const querySnapshot = await getDocs(collection(db, "escaloes"));
    select.innerHTML = "";
    querySnapshot.forEach(doc => {
        const opt = document.createElement('option');
        opt.value = doc.data().nome;
        opt.textContent = doc.data().nome;
        select.appendChild(opt);
    });
}
carregarEscaloesNoSelect();
