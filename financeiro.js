import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. PROTEÇÃO DE ACESSO ---
if (localStorage.getItem('viana_auth') !== 'true') {
    window.location.href = 'login.html';
}

const listaFinanceiro = document.getElementById('lista-financeiro-escaloes');
const filtroEscalao = document.getElementById('filtro-escalao-fin');
const filtroStatus = document.getElementById('filtro-status-fin');
const filtroAno = document.getElementById('filtro-ano-fin');
const btnLogout = document.getElementById('btn-logout');

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- 2. LÓGICA DO BOTÃO SAIR (CORRIGIDO) ---
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('viana_auth');
        localStorage.removeItem('viana_user');
        window.location.href = 'login.html';
    });
}

/**
 * Função para carregar e filtrar os dados financeiros
 */
async function carregarFinanceiro() {
    try {
        const anoSelecionado = parseInt(filtroAno.value);
        const dataHoje = new Date();
        const anoReal = dataHoje.getFullYear();
        const mesReal = dataHoje.getMonth(); // 0 = Jan, 3 = Abr...

        listaFinanceiro.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">A sincronizar dados de ${anoSelecionado}...</p>`;

        // Carregar Escalões (apenas na primeira vez)
        if (filtroEscalao.options.length === 0) {
            const snapEsc = await getDocs(query(collection(db, "escaloes"), orderBy("nome", "asc")));
            filtroEscalao.innerHTML = '<option value="todos">Todos os Escalões</option>';
            snapEsc.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.data().nome; opt.textContent = d.data().nome;
                filtroEscalao.appendChild(opt);
            });
        }

        // Carregar Atletas
        const snapAtl = await getDocs(query(collection(db, "atletas"), orderBy("nome", "asc")));
        let atletas = snapAtl.docs.map(d => ({ id: d.id, ...d.data() }));

        // Filtro de Escalão
        if (filtroEscalao.value !== "todos") {
            atletas = atletas.filter(a => a.escalao === filtroEscalao.value);
        }
        
        // FILTRO DE PENDÊNCIAS INTELIGENTE (Cruza Ano e Mês Atual)
        if (filtroStatus.value === "pendente") {
            atletas = atletas.filter(a => {
                const pagsAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                
                // Se o ano selecionado é o passado, mostra quem deve qualquer mês
                if (anoSelecionado < anoReal) {
                    return meses.some((_, i) => !pagsAno[`mes_${i}`]);
                } 
                // Se é o ano atual, mostra quem deve ATÉ ao mês em que estamos
                else if (anoSelecionado === anoReal) {
                    for (let i = 0; i <= mesReal; i++) {
                        if (!pagsAno[`mes_${i}`]) return true; // Falta pagamento neste mês ou anterior
                    }
                    return false; // Pagou tudo até hoje
                }
                // Anos futuros não têm pendências acumuladas
                return false;
            });
        }

        // Agrupar por Escalão
        const grupos = atletas.reduce((acc, a) => {
            if (!acc[a.escalao]) acc[a.escalao] = [];
            acc[a.escalao].push(a);
            return acc;
        }, {});

        listaFinanceiro.innerHTML = "";

        if (Object.keys(grupos).length === 0) {
            listaFinanceiro.innerHTML = "<p style='text-align:center; padding:40px; color:#888;'>Nenhuma pendência encontrada para este filtro.</p>";
            return;
        }

        // Renderizar Tabelas
        for (const esc in grupos) {
            const seccao = document.createElement('div');
            seccao.className = "escalao-group";
            seccao.innerHTML = `
                <div class="escalao-header">
                    <span style="font-weight:800; font-size:0.9rem;">${esc.toUpperCase()} <small>(${grupos[esc].length} Atletas)</small></span>
                    <span class="seta">▼</span>
                </div>
                <div class="escalao-content" style="display:none;">
                    <table class="tabela-fin">
                        <thead><tr><th>Nome</th>${meses.map(m => `<th>${m}</th>`).join('')}</tr></thead>
                        <tbody>
                            ${grupos[esc].map(a => {
                                const dadosAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                                return `<tr>
                                    <td>${a.nome.toUpperCase()}</td>
                                    ${meses.map((_, i) => {
                                        const pago = dadosAno[`mes_${i}`] === true;
                                        return `<td><input type="checkbox" class="check-pag" data-id="${a.id}" data-ano="${anoSelecionado}" data-mes="mes_${i}" ${pago ? 'checked' : ''}></td>`;
                                    }).join('')}
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            const header = seccao.querySelector('.escalao-header');
            const content = seccao.querySelector('.escalao-content');
            header.onclick = () => {
                const isOff = content.style.display === "none";
                content.style.display = isOff ? "block" : "none";
            };

            // Salvar alteração automática
            seccao.querySelectorAll('.check-pag').forEach(input => {
                input.onchange = async (e) => {
                    const { id, ano, mes } = e.target.dataset;
                    const valor = e.target.checked;
                    try {
                        const ref = doc(db, "atletas", id);
                        await updateDoc(ref, { [`pagamentos.${ano}.${mes}`]: valor });
                        
                        // Se estivermos no modo pendentes, remove a atleta da vista se ela pagar o que deve
                        if (filtroStatus.value === "pendente" && valor === true) {
                            // Pequeno delay para o utilizador ver o check antes de sumir
                            setTimeout(() => carregarFinanceiro(), 500);
                        }
                    } catch (err) {
                        alert("Erro ao gravar.");
                        e.target.checked = !valor;
                    }
                };
            });

            listaFinanceiro.appendChild(seccao);
        }
    } catch (e) { console.error(e); }
}

// Eventos
filtroEscalao.onchange = carregarFinanceiro;
filtroStatus.onchange = carregarFinanceiro;
filtroAno.onchange = carregarFinanceiro;

carregarFinanceiro();
