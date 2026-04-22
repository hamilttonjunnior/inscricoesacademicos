import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');
const listaTreinadoresCards = document.getElementById('lista-treinadores-cards');

const tituloForm = document.getElementById('titulo-form-treinador');
const btnGravar = document.getElementById('btn-gravar-t');
const botoesEdicao = document.getElementById('botoes-edicao-t');
const treinadorIdOculto = document.getElementById('treinador-id');

// Ícone Lixeira SVG
const iconeLixeira = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
// Ícone Editar SVG
const iconeEditar = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;

async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        listaPreview.innerHTML = "";
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const id = d.id; const nome = d.data().nome;
            const opt = document.createElement('option'); opt.value = nome; opt.textContent = nome;
            selectEscalao.appendChild(opt);

            const tag = document.createElement('div');
            tag.style.cssText = "display:flex; align-items:center; gap:8px; background:#f5f5f7; padding:6px 12px; border-radius:6px; border:1px solid #e5e5e7; font-size:0.75rem; font-weight:700;";
            tag.innerHTML = `<span>${nome}</span>`;
            
            const btnDel = document.createElement('button');
            btnDel.innerHTML = iconeLixeira;
            btnDel.style.cssText = "background:transparent; color:#ff3b30; border:none; cursor:pointer; display:flex; align-items:center; padding:2px;";
            btnDel.onclick = async () => {
                if(confirm(`Eliminar escalão ${nome}?`)) {
                    await deleteDoc(doc(db, "escaloes", id));
                    carregarEscaloes();
                }
            };
            tag.appendChild(btnDel);
            listaPreview.appendChild(tag);
        });
    } catch (e) { console.error(e); }
}

async function carregarTreinadores() {
    try {
        const q = query(collection(db, "treinadores"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        listaTreinadoresCards.innerHTML = "";
        
        if (snap.empty) {
            listaTreinadoresCards.innerHTML = "<p style='color:#888; text-align:center;'>Nenhum treinador encontrado.</p>";
            return;
        }

        snap.forEach(d => {
            const t = d.data();
            const id = d.id;

            const card = document.createElement('div');
            card.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px; border:1px solid #eee; border-radius:6px; background:#fff; margin-bottom:10px;";
            card.innerHTML = `
                <div>
                    <strong style="font-size:0.9rem; display:block; color:#1a1a1a;">${t.nome}</strong>
                    <small style="color:#888; font-weight:500;">${t.escalao.toUpperCase()} • ${t.telefone}</small>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-edit-t" style="background:#f5f5f7; border:none; padding:8px; border-radius:4px; cursor:pointer; color:#333;">${iconeEditar}</button>
                    <button class="btn-del-t" style="background:#fff0f0; border:none; padding:8px; border-radius:4px; cursor:pointer; color:#ff3b30;">${iconeLixeira}</button>
                </div>
            `;

            card.querySelector('.btn-edit-t').onclick = () => {
                treinadorIdOculto.value = id;
                document.getElementById('t-nome').value = t.nome;
                document.getElementById('t-telefone').value = t.telefone;
                document.getElementById('t-escalao-vinculo').value = t.escalao;
                document.getElementById('t-licenca').value = t.licenca || "";
                
                tituloForm.innerText = "EDITAR TREINADOR";
                btnGravar.style.display = 'none';
                botoesEdicao.style.display = 'flex';
            };
            
            card.querySelector('.btn-del-t').onclick = async () => {
                if(confirm(`Remover ${t.nome}?`)) {
                    await deleteDoc(doc(db, "treinadores", id));
                    carregarTreinadores();
                }
            };

            listaTreinadoresCards.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

function resetarForm() {
    formTreinador.reset();
    treinadorIdOculto.value = "";
    tituloForm.innerText = "REGISTO DE STAFF";
    btnGravar.style.display = 'block';
    botoesEdicao.style.display = 'none';
}

document.getElementById('btn-cancelar-t').onclick = () => resetarForm();

document.getElementById('btn-atualizar-t').onclick = async () => {
    const id = treinadorIdOculto.value;
    const novosDados = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value
    };
    await updateDoc(doc(db, "treinadores", id), novosDados);
    alert("Treinador atualizado!");
    resetarForm();
    carregarTreinadores();
};

formTreinador.onsubmit = async (e) => {
    e.preventDefault();
    if (treinadorIdOculto.value) return;

    const dados = {
        nome: document.getElementById('t-nome').value,
        telefone: document.getElementById('t-telefone').value,
        escalao: document.getElementById('t-escalao-vinculo').value,
        licenca: document.getElementById('t-licenca').value,
        data_registo: new Date().toISOString()
    };

    await addDoc(collection(db, "treinadores"), dados);
    alert("Treinador registado!");
    formTreinador.reset();
    carregarTreinadores();
};

document.getElementById('btn-add-escalao').onclick = async () => {
    const nome = document.getElementById('novo-escalao').value.trim();
    if(nome) {
        await addDoc(collection(db, "escaloes"), { nome });
        document.getElementById('novo-escalao').value = "";
        carregarEscaloes();
    }
};

carregarEscaloes();
carregarTreinadores();
