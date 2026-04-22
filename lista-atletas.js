import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('lista-atletas-cards');
const inputBusca = document.getElementById('filtro-nome');
const selectFiltro = document.getElementById('filtro-escalao');

let todasAtletas = [];

async function carregarDados() {
    const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
    const snapshot = await getDocs(q);
    todasAtletas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Carregar tbm os filtros de escalão
    const snapEsc = await getDocs(collection(db, "escaloes"));
    selectFiltro.innerHTML = '<option value="">Todos os Escalões</option>';
    snapEsc.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.data().nome; opt.textContent = e.data().nome;
        selectFiltro.appendChild(opt);
    });

    renderizar(todasAtletas);
}

function renderizar(lista) {
    container.innerHTML = "";
    lista.forEach(atleta => {
        const card = document.createElement('div');
        card.className = 'accordion';
        card.innerHTML = `
            <div class="accordion-header">
                <div><strong>${atleta.nome}</strong><br><small>${atleta.escalao}</small></div>
                <span>DETALHES ▼</span>
            </div>
            <div class="accordion-content">
                <p>NIF: ${atleta.nif || '---'} | Telemóvel: ${atleta.telefone}</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-editar" style="background:#eee; color:#333; border:1px solid #ccc; flex:1; padding:10px;">EDITAR FICHA</button>
                    <button class="btn-eliminar" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; flex:1; padding:10px;">ELIMINAR</button>
                </div>
            </div>
        `;

        card.querySelector('.accordion-header').onclick = () => card.classList.toggle('active');

        // EDITAR
        card.querySelector('.btn-editar').onclick = () => {
            localStorage.setItem('editandoAtleta', JSON.stringify(atleta));
            window.location.href = 'atletas.html';
        };

        // ELIMINAR
        card.querySelector('.btn-eliminar').onclick = async () => {
            if(confirm("Eliminar " + atleta.nome + "?")) {
                await deleteDoc(doc(db, "atletas", atleta.id));
                carregarDados();
            }
        };

        container.appendChild(card);
    });
}

inputBusca.oninput = () => {
    const termo = inputBusca.value.toLowerCase();
    const filtradas = todasAtletas.filter(a => a.nome.toLowerCase().includes(termo));
    renderizar(filtradas);
};

carregarDados();
