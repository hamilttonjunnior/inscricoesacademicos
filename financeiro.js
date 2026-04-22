import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- SEGURANÇA ---
if (localStorage.getItem('viana_auth') !== 'true') {
    window.location.href = 'login.html';
}

const listaFinanceiro = document.getElementById('lista-financeiro-escaloes');
const filtroEscalao = document.getElementById('filtro-escalao-fin');
const filtroStatus = document.getElementById('filtro-status-fin');
const filtroAno = document.getElementById('filtro-ano-fin');
const btnLogout = document.getElementById('btn-logout');

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- SAIR (LOGOUT) ---
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('viana_auth');
        localStorage.removeItem('viana_user');
        window.location.href = 'login.html';
    });
}

async function carregarFinanceiro() {
    try {
        const anoSelecionado = parseInt(filtroAno.value);
        const hoje = new Date();
        const anoCorrente = hoje.getFullYear();
        const mesCorrenteIndex = hoje.getMonth(); 

        listaFinanceiro.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">A sincronizar dados...</p>`;

        // Carregar Escalões
        if (filtroEscalao.options.length === 0) {
            const snapEsc = await getDocs(query(collection(db, "escaloes"), orderBy("nome", "asc")));
            filtroEscalao.innerHTML = '<option value="todos">Todos os Escalões</option>';
            snapEsc.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.data().nome; opt.textContent = d.data().nome;
                filtroEscalao.appendChild(opt);
            });
        }

        const snapAtl = await getDocs(query(collection(db, "atletas"), orderBy("nome", "asc")));
        let atletas = snapAtl.docs.map(d => ({ id: d.id, ...d.data() }));

        if (filtroEscalao.value !== "todos") {
            atletas = atletas.filter(a => a.escalao === filtroEscalao.value);
        }
        
        // --- REGRA: PENDÊNCIA ACUMULADA ---
        if (filtroStatus.value === "pendente") {
            atletas = atletas.filter(a => {
                const pagsAno = (a.pagamentos && a.pagamentos[anoSelecionado]) ? a.pagamentos[anoSelecionado] : {};
                
                if (anoSelecionado < anoCorrente) {
                    return meses.some((_, i) => !pagsAno[`mes_${i}`]);
                } 
                else if (anoSelecionado === anoCorrente) {
                    // Verifica se falha QUALQUER mês de Jan até hoje
                    for (let i = 0; i <= mesCorrenteIndex; i++) {
                        if (!pagsAno[`mes_${i}`]) return true; 
                    }
                    return false; // Está tudo pago até ao mês atual
                }
                return false; 
            });
        }

        const grupos = atletas.reduce((acc, a) => {
            if (!acc[a.escalao]) acc[a.escalao] = [];
            acc[a.escalao].push(a);
            return acc;
        }, {});

        listaFinanceiro.innerHTML = "";

        if (Object.keys(grupos).length === 0) {
            listaFinanceiro.innerHTML = "<p style='text-align:center; padding:40px; color:#888;'>Sem devedoras para este filtro!</p>";
            return;
        }

        for (const esc in grupos) {
            const seccao = document.createElement('div');
            seccao.className = "escalao-group";
            seccao.innerHTML = `
                <div class="escalao-header">
                    <span style="font-weight:800; font-size:0.9rem;">${esc.toUpperCase()} <small>(${grupos[esc].length})</small></span>
                    <span>▼</span>
                </div>
                <div class="escalao-content" style="display:none; overflow-x:auto;">
                    <table class="tabela-fin">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                ${meses.map((m, i) => {
                                    const isMesAtual = (i === mesCorrenteIndex && anoSelecionado === anoCorrente);
                                    return `<th style="${isMesAtual ? 'background:#fff0f0; color:#dc2626; border-bottom: 2px solid #dc2626;' : ''}">${m}</th>`;
                                }).join('')}
                            </tr>
                        </thead>
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
            header.onclick = () => content.style.display = content.style.display === "block" ? "none" : "block";

            seccao.querySelectorAll('.check-pag').forEach(input => {
                input.onchange = async (e) => {
                    const { id, ano, mes } = e.target.dataset;
                    const valor = e.target.checked;
                    try {
                        await updateDoc(doc(db, "atletas", id), { [`pagamentos.${ano}.${mes}`]: valor });
                        
                        // Se estivermos no filtro de devedoras, recarrega para ver se ela limpou a dívida total
                        if (filtroStatus.value === "pendente") {
                            setTimeout(() => carregarFinanceiro(), 400);
                        }
                    } catch (err) { alert("Erro!"); e.target.checked = !valor; }
                };
            });
            listaFinanceiro.appendChild(seccao);
        }
    } catch (e) { console.error(e); }
}

filtroEscalao.onchange = carregarFinanceiro;
filtroStatus.onchange = carregarFinanceiro;
filtroAno.onchange = carregarFinanceiro;

carregarFinanceiro();
