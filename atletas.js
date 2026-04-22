import { db } from './database.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formAtleta = document.getElementById('form-atleta');
const selectEscalao = document.getElementById('atleta-escalao');

// Carregar Escalões Dinâmicos
async function carregarEscaloes() {
    try {
        const querySnapshot = await getDocs(collection(db, "escaloes"));
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        querySnapshot.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.data().nome;
            opt.textContent = doc.data().nome;
            selectEscalao.appendChild(opt);
        });
    } catch (e) {
        console.error("Erro ao carregar escalões:", e);
    }
}

// Gravar Atleta
if (formAtleta) {
    formAtleta.addEventListener('submit', async (e) => {
        e.preventDefault();

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
            licenca_fpv: document.getElementById('licenca').value,
            isento: document.getElementById('isento').value,
            status_pagamento: false,
            data_cadastro: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "atletas"), novaAtleta);
            alert("Atleta " + novaAtleta.nome + " gravada com sucesso!");
            formAtleta.reset();
        } catch (error) {
            alert("Erro ao gravar. Verifique a consola.");
            console.error(error);
        }
    });
}

carregarEscaloes();
