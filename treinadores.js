import { db } from './database.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Seletores de Elementos
const btnAddEscalao = document.getElementById('btn-add-escalao');
const inputNovoEscalao = document.getElementById('novo-escalao');
const listaPreview = document.getElementById('lista-escaloes-preview');
const selectEscalao = document.getElementById('t-escalao-vinculo');
const formTreinador = document.getElementById('form-treinador');

/**
 * 1. CARREGAR E MOSTRAR ESCALÕES (Com botão de eliminar)
 * Busca os escalões no Firebase e cria as tags visuais com o "X" para apagar.
 */
async function carregarEscaloes() {
    try {
        const q = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snap = await getDocs(q);
        
        // Limpar o que existe antes de recarregar
        listaPreview.innerHTML = "";
        selectEscalao.innerHTML = '<option value="">Selecione o Escalão</option>';
        
        snap.forEach(d => {
            const id = d.id;
            const nome = d.data().nome;
            
            // Adicionar a opção ao menu Select do treinador
            const opt = document.createElement('option');
            opt.value = nome;
            opt.textContent = nome;
            selectEscalao.appendChild(opt);
            
            // Criar a Tag Visual com o botão de eliminar
            const tagContainer = document.createElement('div');
            tagContainer.style.cssText = `
                display: flex; 
                align-items: center; 
                background: #fafafa; 
                padding: 6px 12px; 
                border-radius: 4px; 
                border: 1px solid #e0e0e0;
                gap: 10px; 
                margin-bottom: 5px;
            `;

            const textoEscalao = document.createElement('span');
            textoEscalao.style.cssText = "font-size: 0.75rem; font-weight: 600; color: #1a1a1a; text-transform: uppercase;";
            textoEscalao.textContent = nome;

            const btnDelete = document.createElement('span');
            btnDelete.innerHTML = "&times;"; // Símbolo de fechar (X)
            btnDelete.style.cssText = "cursor: pointer; color: #dc2626; font-weight: 800; font-size: 1.2rem; line-height: 1; padding: 0 2px;";
            btnDelete.title = "Eliminar Escalão";
            
            // Lógica para Eliminar o Escalão
            btnDelete.onclick = async () => {
                if (confirm(`Tem a certeza que deseja eliminar o escalão "${nome}"?`)) {
                    try {
                        await deleteDoc(doc(db, "escaloes", id));
                        alert("Escalão removido com sucesso.");
                        carregarEscaloes(); // Recarrega a lista e o select automaticamente
                    } catch (error) {
                        console.error("Erro ao eliminar:", error);
                        alert("Erro ao eliminar o escalão.");
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
            alert("Por favor, introduza o nome do escalão!");
            return;
        }

        try {
            await addDoc(collection(db, "escaloes"), { nome: nome });
            inputNovoEscalao.value = ""; // Limpa o campo
            alert("Escalão '" + nome + "' criado!");
            carregarEscaloes(); // Atualiza a visualização
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro ao guardar o escalão no banco de dados.");
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
            morada: document.getElementById('t-morada').value,
            data_registo: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "treinadores"), novoTreinador);
            alert("Treinador " + novoTreinador.nome + " registado com sucesso!");
            formTreinador.reset();
        } catch (e) {
            console.error("Erro ao registar treinador:", e);
            alert("Erro técnico ao registar o treinador.");
        }
    });
}

// Inicializar a página
carregarEscaloes();
