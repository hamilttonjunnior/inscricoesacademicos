import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('lista-atletas-cards');
const inputBusca = document.getElementById('filtro-nome');
const selectFiltro = document.getElementById('filtro-escalao');

let todasAtletas = [];

// 1. Carregar Escalões para o Filtro
async function carregarFiltros() {
    const snap = await getDocs(collection(db, "escaloes"));
    selectFiltro.innerHTML = '<option value="">Todos os Escalões</option>';
    snap.forEach(doc => {
        const opt = document.createElement('option');
        opt.value = doc.data().nome;
        opt.textContent = doc.data().nome;
        selectFiltro.appendChild(opt);
    });
}

// 2. Carregar e Renderizar Atletas
async function carregarAtletas() {
    try {
        const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapshot = await getDocs(q);
        todasAtletas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizar(todasAtletas);
    } catch (e) {
        container.innerHTML = "<p>Erro ao carregar dados.</p>";
    }
}

function renderizar(lista) {
    container.innerHTML = "";
    
    if(lista.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; padding: 20px;'>Nenhuma atleta encontrada.</p>";
        return;
    }

    lista.forEach(atleta => {
        const card = document.createElement('div');
        card.className = 'accordion';
        card.innerHTML = `
            <div class="accordion-header">
                <div style="text-align: left;">
                    <span style="display: block; font-size: 1rem; color: #1a1a1a; font-weight: 700;">${atleta.nome}</span>
                    <small style="color: #888; text-transform: uppercase; font-size: 0.7rem; font-weight: 700;">${atleta.escalao}</small>
                </div>
                <span style="color: #aaa; font-size: 0.75rem;">DETALHES ▼</span>
            </div>
            <div class="accordion-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.85rem; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <div>
                        <p><strong>Nascimento:</strong> ${atleta.data_nascimento}</p>
                        <p><strong>CC:</strong> ${atleta.documento_id || '---'}</p>
                        <p><strong>NIF:</strong> ${atleta.nif || '---'}</p>
                        <p><strong>Utente:</strong> ${atleta.numero_utente || '---'}</p>
                    </div>
                    <div>
                        <p><strong>Telemóvel:</strong> ${atleta.telefone}</p>
                        <p><strong>Pai:</strong> ${atleta.nome_pai || '---'}</p>
                        <p><strong>Mãe:</strong> ${atleta.nome_mae || '---'}</p>
                        <p><strong>Licença FPV:</strong> ${atleta.licenca_fpv || 'Pendente'}</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-editar" data-id="${atleta.id}" style="background: #f4f4f4; color: #333; border: 1px solid #ddd; padding: 8px 15px; flex: 1;">EDITAR DADOS</button>
                    <button class="btn-eliminar" data-id="${atleta.id}" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 8px 15px; flex: 1;">ELIMINAR ATLETA</button>
                </div>
            </div>
        `;
        
        // Toggle Accordion
        card.querySelector('.accordion-header').onclick = (e) => {
            card.classList.toggle('active');
        };

        // Evento Eliminar
        card.querySelector('.btn-eliminar').onclick = async (e) => {
            e.stopPropagation();
            if(confirm(`Tem a certeza que deseja eliminar a atleta ${atleta.nome}? Esta ação não pode ser desfeita.`)) {
                await deleteDoc(doc(db, "atletas", atleta.id));
                carregarAtletas();
            }
        };

        // Evento Editar
        card.querySelector('.btn-editar').onclick = (e) => {
            e.stopPropagation();
            prepararEdicao(atleta);
        };

        container.appendChild(card);
    });
}

// 3. Função para Editar Atleta
async function prepararEdicao(atleta) {
    const novoNome = prompt("Nome Completo:", atleta.nome);
    const novoTel = prompt("Telemóvel:", atleta.telefone);
    const novoEscalao = prompt("Escalão (Certifique-se de escrever igual ao original):", atleta.escalao);

    if (novoNome && novoTel) {
        try {
            const atletaRef = doc(db, "atletas", atleta.id);
            await updateDoc(atletaRef, {
                nome: novoNome,
                telefone: novoTel,
                escalao: novoEscalao
            });
            alert("Dados atualizados!");
            carregarAtletas();
        } catch (e) {
            alert("Erro ao atualizar.");
        }
    }
}

// 4. Filtros
function filtrar() {
    const termo = inputBusca.value.toLowerCase();
    const escalao = selectFiltro.value;
    const filtradas = todasAtletas.filter(a => {
        const bateNome = a.nome.toLowerCase().includes(termo);
        const bateEscalao = escalao === "" || a.escalao === escalao;
        return bateNome && bateEscalao;
    });
    renderizar(filtradas);
}

inputBusca.addEventListener('input', filtrar);
selectFiltro.addEventListener('change', filtrar);

carregarFiltros();
carregarAtletas();
