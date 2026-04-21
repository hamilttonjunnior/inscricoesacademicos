import { db } from './database.js';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputEscalao = document.getElementById('novo-escalao');
const listaEscaloesTags = document.getElementById('lista-escaloes-tags');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');
const listaTreinadores = document.getElementById('lista-treinadores');

// --- LÓGICA DE ESCALÕES ---

async function carregarEscaloes() {
    const querySnapshot = await getDocs(collection(db, "escaloes"));
    listaEscaloesTags.innerHTML = "";
    selectEscalao.innerHTML = '<option value="">Selecione um escalão</option>';
    
    querySnapshot.forEach((res) => {
        const esc = res.data().nome;
        // Criar Tag com botão de remover
        const span = document.createElement('span');
        span.style = "background: #002366; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 5px;";
        span.innerHTML = `${esc} <b style="cursor:pointer" onclick="window.removerEscalao('${res.id}')">×</b>`;
        listaEscaloesTags.appendChild(span);

        // Adicionar ao Select do formulário
        const opt = document.createElement('option');
        opt.value = esc;
        opt.textContent = esc;
        selectEscalao.appendChild(opt);
    });
}

btnAddEscalao.onclick = async () => {
    if(!inputEscalao.value) return;
    await addDoc(collection(db, "escaloes"), { nome: inputEscalao.value });
    inputEscalao.value = "";
    carregarEscaloes();
};

window.removerEscalao = async (id) => {
    if(confirm("Remover este escalão?")) {
        await deleteDoc(doc(db, "escaloes", id));
        carregarEscaloes();
    }
};

// --- LÓGICA DE TREINADORES ---

formTreinador.onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('t-nome').value,
        nif: document.getElementById('t-nif').value,
        licenca: document.getElementById('t-licenca').value,
        telefone: document.getElementById('t-telefone').value,
        morada: document.getElementById('t-morada').value,
        escalao: document.getElementById('t-escalao-vinculo').value
    };

    await addDoc(collection(db, "treinadores"), dados);
    alert("Treinador gravado!");
    formTreinador.reset();
    carregarTreinadores();
};

async function carregarTreinadores() {
    const querySnapshot = await getDocs(collection(db, "treinadores"));
    listaTreinadores.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const t = doc.data();
        const card = document.createElement('div');
        card.className = 'card-atleta';
        card.style.borderLeftColor = "#f39c12";
        card.innerHTML = `
            <h3>${t.nome}</h3>
            <p><strong>Escalão:</strong> ${t.escalao || 'Nenhum'}</p>
            <p><strong>Licença:</strong> ${t.licenca}</p>
            <p><strong>Contacto:</strong> ${t.telefone}</p>
            <button onclick="window.removerTreinador('${doc.id}')" style="background:red; padding:5px; font-size:12px; margin-top:10px;">Remover</button>
        `;
        listaTreinadores.appendChild(card);
    });
}

window.removerTreinador = async (id) => {
    if(confirm("Remover treinador?")) {
        await deleteDoc(doc(db, "treinadores", id));
        carregarTreinadores();
    }
};

// Inicialização
carregarEscaloes();
carregarTreinadores();