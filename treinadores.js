import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

// 1. CARREGAR E MOSTRAR ESCALÕES
async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        
        // Limpar visual e select
        listaPreview.innerHTML = "";
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const nome = d.data().nome;
            
            // Adicionar ao Select do formulário
            const opt = document.createElement('option');
            opt.value = nome; opt.textContent = nome;
            selectEscalao.appendChild(opt);
            
            // Adicionar à lista de visualização (tags cinzas)
            const tag = document.createElement('span');
            tag.style.cssText = "background:#eee; padding:5px 12px; border-radius:15px; font-size:0.7rem; font-weight:700; color:#333; border:1px solid #ddd;";
            tag.textContent = nome;
            listaPreview.appendChild(tag);
        });
    } catch (e) {
        console.error("Erro ao carregar escalões:", e);
    }
}

// 2. ADICIONAR NOVO ESCALÃO
btnAddEscalao.onclick = async () => {
    const nome = inputNovoEscalao.value.trim();
    
    if (nome === "") {
        alert("Escreva o nome do escalão!");
        return;
    }

    try {
        await addDoc(collection(db, "escaloes"), { nome: nome });
        inputNovoEscalao.value = "";
        alert("Escalão adicionado!");
        carregarEscaloes(); // Atualiza a lista na hora
    } catch (e) {
        alert("Erro ao salvar escalão.");
        console.error(e);
    }
};

// 3. GRAVAR TREINADOR
formTreinador.onsubmit = async (e) => {
    e.preventDefault();
    
    const novoTreinador = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        nif: document.getElementById('t-nif').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value,
        morada: document.getElementById('t-morada').value,
        data_registo: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "treinadores"), novoTreinador);
        alert("Treinador " + novoTreinador.nome + " registado!");
        formTreinador.reset();
    } catch (e) {
        alert("Erro ao registar treinador.");
    }
};

// Iniciar a página carregando os dados
carregarEscaloes();
