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
 * Função para carregar os dados financeiros com isolamento de ano
 */
async function carregarFinanceiro() {
    try {
        const anoSelecionado = filtroAno.value; // Pega o ano selecionado (ex: 2027)

        // IMPORTANTE: Limpar a lista visualmente antes de carregar o novo ano
        listaFinanceiro.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">A carregar dados de ${anoSelecionado}...</p>`;

        // 1. Carregar Escalões (apenas se o select estiver vazio)
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

        // 2. Carregar Atletas atualizadas
        const qAtl = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapAtl = await getDocs(qAtl);
        let atletas = snapAtl.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Aplicar Filtro de Escalão
        if (filtroEscalao.value !== "todos") {
            atletas = atletas.filter(a => a.escalao === filtroEscalao.value);
        }
        
        // 4. Aplicar Filtro de Status (Pendentes APENAS no ano selecionado)
        if (filtroStatus.value === "pendente") {
            atletas = atletas.filter(a => {
                const pagsAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                // Se algum mês deste ano específico for false/null, ele entra na lista de pendentes
                return meses.some((_, i) => !pagsAno[`mes_${i}`]);
            });
        }

        // 5. Agrupar Atletas por Escalão
        const grupos = atletas.reduce((acc, a) => {
            if (!acc[a.escalao]) acc[a.escalao] = [];
            acc[a.escalao].push(a);
            return acc;
        }, {});

        // Limpar novamente antes de renderizar
        listaFinanceiro.innerHTML = "";

        if (Object.keys(grupos).length === 0) {
            listaFinanceiro.innerHTML = "<p style='text-align:center; padding:40px; color:#888;'>Nenhum registro para esta seleção.</p>";
            return;
        }

        // 6. Criar as Tabelas
        for (const esc in grupos) {
            const seccao = document.createElement('div');
            seccao.className = "escalao-group";
            
            seccao.innerHTML = `
                <div class="escalao-header">
                    <span style="font-weight:800; font-size:0.9rem;">
                        ${esc.toUpperCase()} 
                        <small style="color:#888; font-weight:400; margin-left:10px;">(${grupos[esc].length} Atletas - Ano ${anoSelecionado})</small>
                    </span>
                    <span class="seta">▼</span>
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
                            ${grupos[esc].map(a => {
                                // Pega apenas os pagamentos do ano que está no seletor
                                const dadosAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                                
                                return `
                                <tr>
                                    <td>${a.nome.toUpperCase()}</td>
                                    ${meses.map((_, i) => {
                                        const pago = dadosAno[`mes_${i}`] === true;
                                        return `
                                            <td>
                                                <input type="checkbox" class="check-pag" 
                                                    data-id="${a.id}" 
                                                    data-ano="${anoSelecionado}" 
                                                    data-mes="mes_${i}" 
                                                    ${pago ? 'checked' : ''}>
                                            </td>`;
                                    }).join('')}
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Lógica do Acordeão
            const header = seccao.querySelector('.escalao-header');
            const content = seccao.querySelector('.escalao-content');
            header.onclick = () => {
                content.style.display = content.style.display === "block" ? "none" : "block";
            };

            // Salvar alteração no Firebase (Isolado por ano)
            seccao.querySelectorAll('.check-pag').forEach(input => {
                input.onchange = async (e) => {
                    const id = e.target.dataset.id;
                    const ano = e.target.dataset.ano; // O ano que estava no seletor no momento da criação
                    const mes = e.target.dataset.mes;
                    const valor = e.target.checked;
                    
                    try {
                        const ref = doc(db, "atletas", id);
                        // Grava no caminho: pagamentos > 2027 > mes_0
                        await updateDoc(ref, { [`pagamentos.${ano}.${mes}`]: valor });
                    } catch (err) {
                        alert("Erro ao guardar dados.");
                        e.target.checked = !valor; // Reverte se falhar
                    }
                };
            });

            listaFinanceiro.appendChild(seccao);
        }
    } catch (e) {
        console.error("Erro Financeiro:", e);
    }
}

// Escutadores de eventos
filtroEscalao.onchange = carregarFinanceiro;
filtroStatus.onchange = carregarFinanceiro;
filtroAno.onchange = carregarFinanceiro; // Força recarregar tudo ao mudar o ano

// Iniciar
carregarFinanceiro();
