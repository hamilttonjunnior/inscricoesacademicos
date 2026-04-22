import { db } from './database.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('lista-atletas-cards');
const inputBusca = document.getElementById('filtro-nome');
const selectFiltro = document.getElementById('filtro-escalao');

let todasAtletas = [];

// 1. Carregar Escalões para o Filtro
async function carregarFiltros() {
    const snap = await getDocs(collection(db, "escaloes"));
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
        container.innerHTML = "<p style='text-align:center; color:#999;'>Nenhuma atleta encontrada.</p>";
        return;
    }

    lista.forEach(atleta => {
        const card = document.createElement('div');
        card.className = 'accordion'; // Reaproveitamos o estilo de fechar/abrir
        card.innerHTML = `
            <div class="accordion-header">
                <div style="text-align: left;">
                    <span style="display: block; font-size: 1rem; color: #1a1a1a;">${atleta.nome}</span>
                    <small style="color: #888; text-transform: uppercase; font-size: 0.7rem; font-weight: 700;">${atleta.escalao}</small>
                </div>
                <span style="color: #ccc;">Ver Ficha ▼</span>
            </div>
            <div class="accordion-content" style="font-size: 0.85rem; color: #333; line-height: 1.8;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p><strong>Nascimento:</strong> ${atleta.data_nascimento}</p>
                        <p><strong>CC:</strong> ${atleta.documento_id || '---'}</p>
                        <p><strong>Validade:</strong> ${atleta.validade_id || '---'}</p>
                        <p><strong>NIF:</strong> ${atleta.nif || '---'}</p>
                    </div>
                    <div>
                        <p><strong>Saúde (Utente):</strong> ${atleta.numero_utente || '---'}</p>
                        <p><strong>Contacto:</strong> ${atleta.telefone}</p>
                        <p><strong>Pai:</strong> ${atleta.nome_pai || '---'}</p>
                        <p><strong>Mãe:</strong> ${atleta.nome_mae || '---'}</p>
                    </div>
                </div>
                <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                    <p><strong>Morada:</strong> ${atleta.morada || 'Não informada'}</p>
                    <p><strong>Licença FPV:</strong> ${atleta.licenca_fpv || 'Pendente'}</p>
                </div>
            </div>
        `;
        
        card.querySelector('.accordion-header').onclick = () => card.classList.toggle('active');
        container.appendChild(card);
    });
}

// 3. Lógica de Filtro em Tempo Real
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
