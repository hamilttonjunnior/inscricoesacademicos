import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        
        listaPreview.innerHTML = "";
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const id = d.id;
            const nome = d.data().nome;
            
            // Adicionar ao Select
            const opt = document.createElement('option');
            opt.value = nome; opt.textContent = nome;
            selectEscalao.appendChild(opt);
            
            // Criar a Tag com Botão de Apagar
            const div = document.createElement('div');
            div.style.cssText = "display:flex; align-items:center; gap:8px; background:#f0f0f0; padding:8px 12px; border-radius:4px; border:1px solid #ddd;";
            
            div.innerHTML = `
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">${nome}</span>
                <button class="btn-delete-esc" data-id="${id}" data-nome="${nome}" 
                    style="background:#ff4d4d; color:white; border:none; border-radius:3px; cursor:pointer; padding:2px 6px; font-weight:800; font-size:0.8rem;">
                    X
                </button>
            `;
            
            listaPreview.appendChild(div);
        });

        // Adicionar evento de clique em todos os botões de apagar criados
        document.querySelectorAll('.btn-delete-esc').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.getAttribute('data-id');
                const nome = e.target.getAttribute('data-nome');
                
                if (confirm(`Deseja mesmo eliminar o escalão ${nome}?`)) {
                    await deleteDoc(doc(db, "escaloes", id));
                    carregarEscaloes();
                }
            };
        });

    } catch (e) { console.error(e); }
}

btnAddEscalao.onclick = async () => {
    const nome = inputNovoEscalao.value.trim();
    if (!nome) return;
    await addDoc(collection(db, "escaloes"), { nome: nome });
    inputNovoEscalao.value = "";
    carregarEscaloes();
};

formTreinador.onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        nif: document.getElementById('t-nif').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value,
        morada: document.getElementById('t-morada').value,
        data_registo: new Date().toISOString()
    };
    await addDoc(collection(db, "treinadores"), dados);
    alert("Treinador gravado!");
    formTreinador.reset();
};

carregarEscaloes();
