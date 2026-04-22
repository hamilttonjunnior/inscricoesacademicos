import { db } from './database.js';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const listaAtletasCards = document.getElementById('lista-atletas-cards');
const filtroEscalao = document.getElementById('filtro-escalao');
const pesquisaNome = document.querySelector('input[placeholder*="Escreve o nome"]');

// Ícones SVG
const iconeLixeira = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
const iconeEditar = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;
const iconeSeta = `<svg class="seta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><path d="m6 9 6 6 6-6"/></svg>`;

async function carregarAtletas(escalaoFiltro = "", nomeFiltro = "") {
    try {
        let q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        
        if (escalaoFiltro && escalaoFiltro !== "Todos os Escalões") {
            q = query(collection(db, "atletas"), where("escalao", "==", escalaoFiltro), orderBy("nome", "asc"));
        }

        const snap = await getDocs(q);
        listaAtletasCards.innerHTML = "";

        let atletas = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (nomeFiltro) {
            atletas = atletas.filter(a => a.nome.toLowerCase().includes(nomeFiltro.toLowerCase()));
        }

        if (atletas.length === 0) {
            listaAtletasCards.innerHTML = "<p style='text-align:center; padding:30px; color:#888;'>Nenhuma atleta encontrada.</p>";
            return;
        }

        atletas.forEach(a => {
            const card = document.createElement('div');
            card.className = "accordion-item";
            card.style.cssText = "background:#fff; border:1px solid #e0e0e0; border-radius:8px; margin-bottom:10px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.02);";

            const dataNasc = a.data_nascimento ? a.data_nascimento.split('-').reverse().join('/') : '---';

            card.innerHTML = `
                <div class="accordion-header" style="padding:15px 20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; background:#fff; user-select:none;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <strong style="font-size:0.95rem; color:#1a1a1a;">${a.nome.toUpperCase()}</strong>
                        <span style="background:#f0f4ff; color:#3b82f6; font-size:0.65rem; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">${a.escalao}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span style="font-size:0.7rem; color:#aaa; font-weight:600;">CONSULTAR</span>
                        ${iconeSeta}
                    </div>
                </div>

                <div class="accordion-content" style="display:none; padding:0 20px 20px 20px; border-top:1px solid #f9f9f9; background:#fafafa;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; font-size: 0.85rem; color: #4b5563; padding-top:15px;">
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">DATA NASCIMENTO</strong> ${dataNasc}</div>
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">TELEMÓVEL</strong> ${a.telefone || '---'}</div>
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">NIF</strong> ${a.nif || '---'}</div>
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">DOC. IDENTIFICAÇÃO</strong> ${a.documento_id || '---'}</div>
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">NACIONALIDADE</strong> ${a.nacionalidade || '---'}</div>
                        <div><strong style="color:#9ca3af; font-size:0.7rem; display:block;">LICENÇA FPV</strong> ${a.licenca_fpv || '---'}</div>
                    </div>
                    
                    <div style="margin-top:15px;">
                        <strong style="color:#9ca3af; font-size:0.7rem; display:block;">MORADA</strong>
                        <span style="font-size: 0.85rem; color: #4b5563;">${a.morada || 'Morada não registada'}</span>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                        <button class="btn-editar-atleta" style="background:#333; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:0.75rem;">${iconeEditar} EDITAR ATLETA</button>
                        <button class="btn-eliminar-atleta" style="background:#fff; color:#ef4444; border:1px solid #fecaca; padding:8px 15px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:0.75rem;">${iconeLixeira} ELIMINAR</button>
                    </div>
                </div>
            `;

            const header = card.querySelector('.accordion-header');
            const content = card.querySelector('.accordion-content');
            const seta = card.querySelector('.seta-icon');

            header.onclick = () => {
                const estaAberto = content.style.display === "block";
                document.querySelectorAll('.accordion-content').forEach(c => c.style.display = "none");
                document.querySelectorAll('.seta-icon').forEach(s => s.style.transform = "rotate(0deg)");

                if (!estaAberto) {
                    content.style.display = "block";
                    seta.style.transform = "rotate(180deg)";
                }
            };

            // Clique no botão Editar (Redirecionamento Corrigido)
            card.querySelector('.btn-editar-atleta').onclick = (e) => {
                e.stopPropagation();
                window.location.href = `atletas.html?edit=${a.id}`;
            };

            // Clique no botão Eliminar
            card.querySelector('.btn-eliminar-atleta').onclick = async (e) => {
                e.stopPropagation();
                if (confirm(`Remover atleta ${a.nome}?`)) {
                    await deleteDoc(doc(db, "atletas", a.id));
                    carregarAtletas(filtroEscalao.value, pesquisaNome.value);
                }
            };

            listaAtletasCards.appendChild(card);
        });
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

if (filtroEscalao) filtroEscalao.onchange = (e) => carregarAtletas(e.target.value, pesquisaNome.value);
if (pesquisaNome) pesquisaNome.oninput = (e) => carregarAtletas(filtroEscalao.value, e.target.value);

carregarAtletas();
