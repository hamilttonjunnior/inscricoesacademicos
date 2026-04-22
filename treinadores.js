import { db } from './database.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnAdd = document.getElementById('btn-add-escalao');
const inputEsc = document.getElementById('novo-escalao');

// Corrigido: Agora o botão funciona com o ouvinte de evento
btnAdd.addEventListener('click', async () => {
    if(!inputEsc.value) return;
    await addDoc(collection(db, "escaloes"), { nome: inputEsc.value });
    inputEsc.value = "";
    location.reload(); // Recarrega para atualizar listas
});

async function carregarTudo() {
    const snapEsc = await getDocs(collection(db, "escaloes"));
    const select = document.getElementById('t-escalao-vinculo');
    const tags = document.getElementById('lista-escaloes-tags');
    
    snapEsc.forEach(res => {
        const nome = res.data().nome;
        tags.innerHTML += `<span class="card-atleta" style="display:inline-block; margin-right:5px; padding:5px">${nome}</span>`;
        select.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}
carregarTudo();
