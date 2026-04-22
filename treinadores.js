import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Seletores de Elementos
const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

/**
 * 1. CARREGAR E MOSTRAR ESCALÕES
 * Busca os escalões no Firebase e cria as tags com o botão de eliminar (X).
 */
async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        
        // Limpa a lista visual e o menu de seleção
        listaPreview.innerHTML = "";
        if (selectEscalao) {
            selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        }
        
        snap.forEach(d => {
            const id = d.id;
            const nome = d.data().nome;
            
            // Adicionar ao Menu Select do Treinador
            if (selectEscalao) {
                const opt = document.createElement('option');
                opt.value = nome;
                opt.textContent = nome;
                selectEscalao.appendChild(opt);
            }
            
            // CRIAR A TAG VISUAL COM O BOTÃO ELIMINAR
            const tagContainer = document.createElement('div');
            tagContainer.style.cssText = `
                display: flex; 
                align-items: center; 
                background: #fafafa; 
                padding: 8px 15px; 
                border-radius: 4px; 
                border: 1px solid #e0e0e0;
                gap: 12px; 
                margin-bottom: 10px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            `;

            const textoEscalao = document.createElement('span');
            textoEscalao.style.cssText = "font-size: 0.75rem; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;";
            textoEscalao.textContent = nome;

            // O BOTÃO DE ELIMINAR (O "X")
            const btnDelete = document.createElement('button');
            btnDelete.innerHTML = "&times;"; 
            btnDelete.style.cssText = `
                background: #fee2e2; 
                color: #dc2626; 
                border: 1px solid #fecaca; 
                border-radius: 3px; 
                cursor: pointer; 
                font-weight: 800; 
                font-size: 1rem; 
                line-height: 1; 
                padding: 2px 6px;
                transition: 0.2s;
            `;
            
            // Evento ao passar o rato no X
            btnDelete.onmouseover = () => btnDelete.style.background = "#fca5a5";
            btnDelete.onmouseout = () => btnDelete.style.background = "#fee2e2";

            // Lógica para Eliminar do Firebase
            btnDelete.onclick = async () => {
                if (confirm(`Desejas eliminar o escalão "${nome}"?`)) {
                    try {
                        await deleteDoc(doc(db, "escaloes", id));
                        alert("Escalão removido!");
                        carregarEscaloes(); // Recarrega tudo
                    } catch (error) {
                        console.error("Erro ao eliminar:", error);
                        alert("Erro ao eliminar. Verifica a consola.");
                    }
                }
            };

            tagContainer.appendChild(textoEscalao);
            tagContainer.appendChild(btnDelete);
            listaPreview.appendChild(tagContainer);
        });
    } catch (e) {
        console.error("Erro ao carregar escalões:", e);
    }
}

/**
 * 2. ADICIONAR NOVO ESCALÃO
 */
if (btnAddEscalao) {
    btnAddEscalao.onclick = async () => {
        const nome = inputNovoEscalao.value.trim();
        
        if (nome === "") {
            alert("Escreve o nome do escalão!");
            return;
        }

        try {
            await addDoc(collection(db, "escaloes"), { nome: nome });
            inputNovoEscalao.value = ""; 
            carregarEscaloes(); 
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro ao guardar. Verifica as permissões do Firebase.");
        }
    };
}

/**
 * 3. REGISTAR TREINADOR
 */
if (formTreinador) {
    formTreinador.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const novoTreinador = {
            nome: document.getElementById('t-nome').value,
            telefone: document.getElementById('t-telefone').value,
            nif: document.getElementById('t-nif').value,
            escalao: document.getElementById('t-escalao-vinculo').value,
            licenca: document.getElementById('t-licenca').value,
            data_registo: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "treinadores"), novoTreinador);
            alert("Treinador " + novoTreinador.nome + " registado!");
            formTreinador.reset();
        } catch (e) {
            console.error("Erro ao registar treinador:", e);
            alert("Erro ao registar.");
        }
    });
}

// Inicializar
carregarEscaloes();
