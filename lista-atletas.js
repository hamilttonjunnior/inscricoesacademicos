import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('lista-atletas-cards');
const inputBusca = document.getElementById('filtro-nome');
const selectFiltro = document.getElementById('filtro-escalao');

let todasAtletas = [];

/**
 * 1. CARREGAR FILTROS (ESCALÕES)
 * Preenche o select de filtros com os escalões existentes no banco de dados.
 */
async function carregarFiltros() {
    try {
        const snap = await getDocs(collection(db, "escaloes"));
        selectFiltro.innerHTML = '<option value="">Todos os Escalões</option>';
        snap.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.data().nome;
            opt.textContent = doc.data().nome;
            selectFiltro.appendChild(opt);
        });
    } catch (e) {
        console.error("Erro ao carregar filtros:", e);
    }
}

/**
 * 2. CARREGAR ATLETAS
 * Procura todas as atletas inscritas e guarda na variável local para pesquisa rápida.
 */
async function carregarAtletas() {
    try {
        const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapshot = await getDocs(q);
        todasAtletas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizar(todasAtletas);
    } catch (e) {
        console.error("Erro ao carregar atletas:", e);
        container.innerHTML = "<p style='text-align:center;'>Erro ao carregar dados.</p>";
    }
}

/**
 * 3. RENDERIZAR LISTA (VISUAL)
 * Cria os cartões expansíveis (accordion) com os botões de ação.
 */
function renderizar(lista) {
    container.innerHTML = "";
    
    if (lista.length === 0) {
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
                <span style="color: #aaa; font-size: 0.75rem;">VER FICHA ▼</span>
            </div>
            <div class="accordion-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.85rem; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <div>
                        <p><strong>Nascimento:</strong> ${atleta.data_nascimento}</p>
                        <p><strong>NIF:</strong> ${atleta.nif || '---'}</p>
                        <p><strong>CC/Doc:</strong> ${atleta.documento_id || '---'}</p>
                        <p><strong>Utente Saúde:</strong> ${atleta.numero_utente || '---'}</p>
                    </div>
                    <div>
                        <p><strong>Telemóvel:</strong> ${atleta.telefone}</p>
                        <p><strong>Enc. Educação:</strong> ${atleta.nome_mae || atleta.nome_pai || '---'}</p>
                        <p><strong>Situação:</strong> ${atleta.isento === 'true' ? 'Isento' : 'Pagante'}</p>
                        <p><strong>Licença FPV:</strong> ${atleta.licenca_fpv || 'Pendente'}</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-editar" style="flex: 1;">EDITAR FICHA COMPLETA</button>
                    <button class="btn-eliminar" style="flex: 1;">ELIMINAR REGISTO</button>
                </div>
            </div>
        `;
        
        // Abrir/Fechar ficha
        card.querySelector('.accordion-header').onclick = () => card.classList.toggle('active');

        // Lógica do Botão ELIMINAR
        card.querySelector('.btn-eliminar').onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Deseja mesmo eliminar permanentemente a atleta ${atleta.nome}?`)) {
                try {
                    await deleteDoc(doc(db, "atletas", atleta.id));
                    alert("Atleta eliminada com sucesso.");
                    carregarAtletas(); // Atualiza a lista
                } catch (error) {
                    alert("Erro ao eliminar.");
                }
            }
        };

        // Lógica do Botão EDITAR (Leva para atletas.html)
        card.querySelector('.btn-editar').onclick = (e) => {
            e.stopPropagation();
            // Guarda o objeto completo da atleta para a outra página ler
            localStorage.setItem('editandoAtleta', JSON.stringify(atleta));
            // Redireciona para o formulário
            window.location.href = 'atletas.html';
        };

        container.appendChild(card);
    });
}

/**
 * 4. PESQUISA E FILTROS EM TEMPO REAL
 */
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

// Eventos de Input
inputBusca.addEventListener('input', filtrar);
selectFiltro.addEventListener('change', filtrar);

// Início
carregarFiltros();
carregarAtletas();
