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
        if (selectEscalao) selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const id = d.id;
            const nome = d.data().nome;
            
            if (selectEscalao) {
                const opt = document.createElement('option');
                opt.value = nome; opt.textContent = nome;
                selectEscalao.appendChild(opt);
            }
            
            // Criar a Tag (Pílula)
            const tag = document.createElement('div');
            tag.style.cssText = "display:flex; align-items:center; gap:8px; background:#f5f5f7; padding:6px 10px; border-radius:6px; border:1px solid #e5e5e7; margin-bottom:5px;";
            
            // Texto do Nome
            const spanNome = document.createElement('span');
            spanNome.style.cssText = "font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#1d1d1f; letter-spacing:0.3px;";
            spanNome.textContent = nome;

            // Botão de Eliminar (X Pequeno e Elegante)
            const btnDel = document.createElement('button');
            btnDel.innerHTML = "&times;"; 
            btnDel.style.cssText = "background:#ffeded; color:#ff3b30; border:none; border-radius:4px; width:18px; height:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; line-height:1; transition: 0.2s;";
            
            btnDel.onmouseover = () => { btnDel.style.background = "#ff3b30"; btnDel.style.color = "white"; };
            btnDel.onmouseout = () => { btnDel.style.background = "#ffeded"; btnDel.style.color = "#ff3b30"; };

            btnDel.onclick = async (e) => {
                e.preventDefault();
                if (confirm(`Eliminar escalão "${nome}"?`)) {
                    try {
                        await deleteDoc(doc(db, "escaloes", id));
                        carregarEscaloes();
                    } catch (err) { alert("Erro ao apagar."); }
                }
            };

            tag.appendChild(spanNome);
            tag.appendChild(btnDel);
            listaPreview.appendChild(tag);
        });
    } catch (e) { console.error(e); }
}

if (btnAddEscalao) {
    btnAddEscalao.onclick = async () => {
        const nome = inputNovoEscalao.value.trim();
        if (!nome) return;
        try {
            await addDoc(collection(db, "escaloes"), { nome: nome });
            inputNovoEscalao.value = "";
            carregarEscaloes();
        } catch (e) { alert("Erro ao salvar."); }
    };
}

if (formTreinador) {
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
        try {
            await addDoc(collection(db, "treinadores"), dados);
            alert("Treinador gravado!");
            formTreinador.reset();
        } catch (e) { alert("Erro ao registar."); }
    };
}

carregarEscaloes();
