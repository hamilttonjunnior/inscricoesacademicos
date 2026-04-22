import { db } from './database.js';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const listaAtletasCards = document.getElementById('lista-atletas-cards');
const filtroEscalao = document.getElementById('filtro-escalao');

// Ícones em SVG para evitar dependências externas
const iconeLixeira = `
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18"></path>
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>`;

const iconeEditar = `
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
</svg>`;

/**
 * Função para carregar as atletas com layout detalhado
 */
async function carregarAtletas(escalaoFiltro = "") {
    try {
        let q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        
        if (escalaoFiltro) {
            q = query(collection(db, "atletas"), where("escalao", "==", escalaoFiltro), orderBy("nome", "asc"));
        }

        const snap = await getDocs(q);
        listaAtletasCards.innerHTML = "";

        if (snap.empty) {
            listaAtletasCards.innerHTML = "<p style='text-align:center; color:#888; padding:40px; width:100%;'>Nenhuma atleta encontrada para esta seleção.</p>";
            return;
        }

        snap.forEach(d => {
            const a = d.data();
            const id = d.id;

            const card = document.createElement('div');
            card.style.cssText = `
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 20px; 
                border: 1px solid #eee; 
                border-radius: 8px; 
                background: #fff; 
                margin-bottom: 12px; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            `;
            
            card.innerHTML = `
                <div style="flex: 1;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                        <strong style="font-size:1.1rem; color:#1a1a1a; letter-spacing:0.5px;">${a.nome.toUpperCase()}</strong>
                        <span style="background:#eef2ff; color:#4f46e5; font-size:0.7rem; padding:3px 10px; border-radius:12px; font-weight:800; border:1px solid #e0e7ff;">
                            ${a.escalao.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; font-size: 0.85rem; color: #555;">
                        <span><strong style="color:#888;">TEL:</strong> ${a.telefone || '---'}</span>
                        <span><strong style="color:#888;">NIF:</strong> ${a.nif || '---'}</span>
                        <span><strong style="color:#888;">CC/DOC:</strong> ${a.documento_id || '---'}</span>
                        <span><strong style="color:#888;">NAC:</strong> ${a.nacionalidade || '---'}</span>
                        <span><strong style="color:#888;">LICENÇA:</strong> ${a.licenca_fpv || '---'}</span>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; margin-left:20px;">
                    <button class="btn-edit" title="Editar" style="background:#f5f5f7; border:1px solid #e5e5e7; padding:10px; border-radius:6px; cursor:pointer; color:#333; transition:0.2s;">
                        ${iconeEditar}
                    </button>
                    <button class="btn-del" title="Eliminar" style="background:#fff0f0; border:1px solid #fecaca; padding:10px; border-radius:6px; cursor:pointer; color:#ff3b30; transition:0.2s;">
                        ${iconeLixeira}
                    </button>
                </div>
            `;

            // Efeitos de Hover nos botões
            const btnEdit = card.querySelector('.btn-edit');
            btnEdit.onmouseover = () => btnEdit.style.background = "#e5e5e7";
            btnEdit.onmouseout = () => btnEdit.style.background = "#f5f5f7";

            const btnDel = card.querySelector('.btn-del');
            btnDel.onmouseover = () => btnDel.style.background = "#ffcccc";
            btnDel.onmouseout = () => btnDel.style.background = "#fff0f0";

            // Evento Editar
            btnEdit.onclick = () => {
                window.location.href = `atletas.html?edit=${id}`;
            };

            // Evento Eliminar
            btnDel.onclick = async () => {
                if (confirm(`Deseja realmente remover a atleta ${a.nome}? Esta ação não pode ser desfeita.`)) {
                    try {
                        await deleteDoc(doc(db, "atletas", id));
                        carregarAtletas(filtroEscalao.value);
                    } catch (error) {
                        alert("Erro ao eliminar a atleta.");
                        console.error(error);
                    }
                }
            };

            listaAtletasCards.appendChild(card);
        });
    } catch (e) {
        console.error("Erro ao carregar lista de atletas:", e);
    }
}

// Ouvinte para o Filtro de Escalão
if (filtroEscalao) {
    filtroEscalao.addEventListener('change', (e) => {
        carregarAtletas(e.target.value);
    });
}

// Inicialização da página
carregarAtletas();
