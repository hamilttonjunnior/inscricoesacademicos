import { db } from './database.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Referências dos elementos
const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const selectEscalaoVinculo = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

/**
 * 1. GESTÃO DE ESCALÕES
 * Adiciona novos escalões (Ex: Iniciadas B) ao sistema.
 */
if (btnAddEscalao) {
    btnAddEscalao.addEventListener('click', async () => {
        const nomeEscalao = inputNovoEscalao.value.trim();
        
        if (!nomeEscalao) {
            alert("Por favor, digite o nome do escalão.");
            return;
        }

        try {
            await addDoc(collection(db, "escaloes"), { nome: nomeEscalao });
            inputNovoEscalao.value = "";
            alert("Escalão " + nomeEscalao + " adicionado!");
            // Recarrega as listas para atualizar os menus
            carregarDadosIniciais();
        } catch (e) {
            console.error("Erro ao adicionar escalão:", e);
        }
    });
}

/**
 * 2. CARREGAR DADOS (Escalões)
 * Preenche o select de vínculo para o cadastro de treinadores.
 */
async function carregarDadosIniciais() {
    try {
        const querySnapshot = await getDocs(collection(db, "escaloes"));
        
        if (selectEscalaoVinculo) {
            selectEscalaoVinculo.innerHTML = '<option value="">Selecione um escalão para o treinador</option>';
            querySnapshot.forEach(doc => {
                const opt = document.createElement('option');
                opt.value = doc.data().nome;
                opt.textContent = doc.data().nome;
                selectEscalaoVinculo.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

/**
 * 3. CADASTRO DE TREINADORES
 * Salva os dados completos do staff no Firebase.
 */
if (formTreinador) {
    formTreinador.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novoTreinador = {
            nome: document.getElementById('t-nome').value,
            nif: document.getElementById('t-nif').value,
            licenca: document.getElementById('t-licenca') ? document.getElementById('t-licenca').value : "",
            telefone: document.getElementById('t-telefone') ? document.getElementById('t-telefone').value : "",
            morada: document.getElementById('t-morada') ? document.getElementById('t-morada').value : "",
            escalao: selectEscalaoVinculo.value,
            data_cadastro: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "treinadores"), novoTreinador);
            alert("Treinador " + novoTreinador.nome + " registado com sucesso!");
            formTreinador.reset();
        } catch (error) {
            console.error("Erro ao salvar treinador:", error);
            alert("Erro ao gravar treinador.");
        }
    });
}

// Inicializa a página carregando os escalões existentes
carregarDadosIniciais();
