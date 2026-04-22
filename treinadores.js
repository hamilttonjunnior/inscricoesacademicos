import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

// Função Principal para Carregar e Mostrar os Escalões com o botão X
async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        
        // Limpar o que existe
        listaPreview.innerHTML = "";
        if (selectEscalao) selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const id = d.id;
            const nome = d.data().nome;
            
            // 1. Adicionar ao Select do Treinador
            if (selectEscalao) {
                const opt = document.createElement('option');
                opt.value = nome;
                opt.textContent = nome;
                selectEscalao.appendChild(opt);
            }
            
            // 2. Criar a Tag (A pílula cinzenta)
            const tag = document.createElement('div');
            tag.style.cssText = "display:flex; align-items:center; gap:10px; background:#eeeeee; padding:8px 15px; border-radius:4px; border:1px solid #cccccc; margin-bottom:5px;";
            
            // Texto do Nome
            const spanNome = document.createElement('span');
            spanNome.style.cssText = "font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#1a1a1a;";
            spanNome.textContent = nome;

            // Botão de Eliminar (O "X" Vermelho)
            const btnDel = document.createElement('button');
            btnDel.innerHTML = "X"; 
            btnDel.style.cssText = "background:#ff4d4d; color:white; border:none; border-radius:3px; width:20px; height:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:10px; transition: 0.2s;";
            
            // Feedback visual ao passar o rato
            btnDel.onmouseover = () => btnDel.style.background = "#cc0000";
            btnDel.onmouseout = () => btnDel.style.background = "#ff4d4d";

            // Lógica de clique para apagar do Firebase
            btnDel.onclick = async (e) => {
                e.preventDefault();
                if (confirm(`Queres mesmo apagar o escalão "${nome}"?`)) {
                    try {
                        await deleteDoc(doc(db, "escaloes", id));
                        carregarEscaloes(); // Recarrega a lista
                    } catch (err) {
                        alert("Erro ao apagar. Tenta novamente.");
                    }
                }
            };

            // Montar e Injetar no HTML
            tag.appendChild(spanNome);
            tag.appendChild(btnDel);
            listaPreview.appendChild(tag);
        });

    } catch (e) {
        console.error("Erro ao carregar escalões:", e);
    }
}

// Evento para Adicionar Novo Escalão
if (btnAddEscalao) {
    btnAddEscalao.onclick = async () => {
        const nome = inputNovoEscalao.value.trim();
        if (!nome) {
            alert("Escreve o nome do escalão!");
            return;
        }
        
        try {
            await addDoc(collection(db, "escaloes"), { nome: nome });
            inputNovoEscalao.value = "";
            carregarEscaloes();
        } catch (e) {
            alert("Erro ao salvar no Firebase.");
        }
    };
}

// Evento para Gravar Treinador
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
            alert("Treinador gravado com sucesso!");
            formTreinador.reset();
        } catch (e) {
            alert("Erro ao registar treinador.");
        }
    };
}

// Iniciar a página
carregarEscaloes();
