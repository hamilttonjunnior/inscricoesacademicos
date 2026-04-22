import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- VERIFICAÇÃO DE SEGURANÇA (AUTH) ---
if (localStorage.getItem('viana_auth') !== 'true') {
    window.location.href = 'login.html';
}

const listaFinanceiro = document.getElementById('lista-financeiro-escaloes');
const filtroEscalao = document.getElementById('filtro-escalao-fin');
const filtroStatus = document.getElementById('filtro-status-fin');
const filtroAno = document.getElementById('filtro-ano-fin');
const btnLogout = document.getElementById('btn-logout');

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Função de Logout
if (btnLogout) {
    btnLogout.onclick = () => {
        localStorage.removeItem('viana_auth');
        localStorage.removeItem('viana_user');
        window.location.href = 'login.html';
    };
}

/**
 * Função principal para carregar e renderizar a tabela financeira
 */
async function carregarFinanceiro() {
    try {
        const anoSelecionado = filtroAno.value; // Pega o ano do seletor (2025, 2026...)

        // Feedback visual de carregamento e limpeza de cache visual
        listaFinanceiro.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">A atualizar dados de ${anoSelecionado}...</p>`;

        // 1. Carregar Escalões para o filtro (apenas se o select estiver vazio)
        if (filtroEscalao.options.length === 0) {
            const qEsc = query(collection(db, "escaloes"), orderBy("nome", "asc"));
            const snapEsc = await getDocs(qEsc);
            filtroEscalao.innerHTML = '<option value="todos">Todos os Escalões</option>';
            snapEsc.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.data().nome; 
                opt.textContent = d.data().nome;
                filtroEscalao.appendChild(opt);
            });
        }

        // 2. Carregar Atletas do Firebase
        const qAtl = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapAtl = await getDocs(qAtl);
        let atletas = snapAtl.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Aplicar Filtros de Escalão
        if (filtroEscalao.value !== "todos") {
            atletas = atletas.filter(a => a.escalao === filtroEscalao.value);
        }
        
        // 4. Aplicar Filtro de Status (Pendentes no ano selecionado)
        if (filtroStatus.value === "pendente") {
            atletas = atletas.filter(a => {
                const pagsAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                return meses.some((_, i) => !pagsAno[`mes_${i}`]);
            });
        }

        // 5. Agrupar por Escalão para criar os Acordeões
        const grupos = atletas.reduce((acc, a) => {
            if (!acc[a.escalao]) acc[a.escalao] = [];
            acc[a.escalao].push(a);
            return acc;
        }, {});

        listaFinanceiro.innerHTML = "";

        if (Object.keys(grupos).length === 0) {
            listaFinanceiro.innerHTML = "<p style='text-align:center; padding:40px; color:#888;'>Nenhum registro encontrado para esta seleção.</p>";
            return;
        }

        // 6. Gerar Visual das Tabelas por Escalão
        for (const esc in grupos) {
            const seccao = document.createElement('div');
            seccao.className = "escalao-group";
            
            seccao.innerHTML = `
                <div class="escalao-header">
                    <span style="font-weight:800; font-size:0.9rem;">
                        ${esc.toUpperCase()} 
                        <small style="color:#888; font-weight:400; margin-left:10px;">
                            (${grupos[esc].length} Atletas em ${anoSelecionado})
                        </small>
                    </span>
                    <span class="seta" style="transition: 0.3s;">▼</span>
                </div>
                <div class="escalao-content" style="display:none;">
                    <table class="tabela-fin">
                        <thead>
                            <tr>
                                <th>Nome da Atleta</th>
                                ${meses.map(m => `<th>${m}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${grupos[esc].map(a => `
                                <tr>
                                    <td>${a.nome.toUpperCase()}</td>
                                    ${meses.map((_, i) => {
                                        // IMPORTANTE: Lê apenas o sub-objeto do ANO selecionado
                                        const pago = (a.pagamentos && a.pagamentos[anoSelecionado] && a.pagamentos[anoSelecionado][`mes_${i}`]) === true;
                                        return `
                                            <td>
                                                <input type="checkbox" class="check-pag" 
                                                    data-id="${a.id}" 
                                                    data-ano="${anoSelecionado}" 
                                                    data-mes="mes_${i}" 
                                                    ${pago ? 'checked' : ''}>
                                            </td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Lógica do Acordeão (Abrir/Fechar)
            const header = seccao.querySelector('.escalao-header');
            const content = seccao.querySelector('.escalao-content');
            const seta = seccao.querySelector('.seta');
            
            header.onclick = () => {
                const isOpen = content.style.display === "block";
                content.style.display = isOpen ? "none" : "block";
                seta.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
            };

            // Lógica de Gravação Automática (Database)
            seccao.querySelectorAll('.check-pag').forEach(input => {
                input.onchange = async (e) => {
                    const id = e.target.dataset.id;
                    const ano = e.target.dataset.ano;
                    const mes = e.target.dataset.mes;
                    const valor = e.target.checked;
                    
                    try {
                        const ref = doc(db, "atletas", id);
                        // Atualiza o campo dinâmico: pagamentos.ANO.mes_X
                        await updateDoc(ref, { [`pagamentos.${ano}.${mes}`]: valor });
                    } catch (err) {
                        alert("Erro ao gravar no banco de dados.");
                        e.target.checked = !valor; // Reverte o check visual se der erro
                    }
                };
            });

            listaFinanceiro.appendChild(seccao);
        }
    } catch (e) {
        console.error("Erro no processamento financeiro:", e);
    }
}

// Ouvintes de alteração nos filtros
filtroEscalao.onchange = carregarFinanceiro;
filtroStatus.onchange = carregarFinanceiro;
filtroAno.onchange = carregarFinanceiro; // Essencial: Recarrega tudo quando o ano muda

// Inicialização ao abrir a página
carregarFinanceiro();
