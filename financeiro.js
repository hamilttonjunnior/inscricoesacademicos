import { db } from './database.js';
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const listaFinanceiro = document.getElementById('lista-financeiro-escaloes');
const filtroEscalao = document.getElementById('filtro-escalao-fin');
const filtroStatus = document.getElementById('filtro-status-fin');

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

async function carregarFinanceiro() {
    try {
        // 1. Carregar Escalões para o filtro
        const qEsc = query(collection(db, "escaloes"), orderBy("nome", "asc"));
        const snapEsc = await getDocs(qEsc);
        if (filtroEscalao.options.length === 0) {
            filtroEscalao.innerHTML = '<option value="todos">Todos os Escalões</option>';
            snapEsc.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.data().nome; opt.textContent = d.data().nome;
                filtroEscalao.appendChild(opt);
            });
        }

        // 2. Carregar Atletas
        const qAtl = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapAtl = await getDocs(qAtl);
        let atletas = snapAtl.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Aplicar Filtros
        if (filtroEscalao.value !== "todos") {
            atletas = atletas.filter(a => a.escalao === filtroEscalao.value);
        }
        
        if (filtroStatus.value === "pendente") {
            atletas = atletas.filter(a => {
                const pags = a.pagamentos || {};
                return meses.some((_, i) => !pags[`mes_${i}`]); // Verifica se algum mês está false/vazio
            });
        }

        // 4. Agrupar por Escalão
        const grupos = atletas.reduce((acc, a) => {
            if (!acc[a.escalao]) acc[a.escalao] = [];
            acc[a.escalao].push(a);
            return acc;
        }, {});

        listaFinanceiro.innerHTML = "";

        if (Object.keys(grupos).length === 0) {
            listaFinanceiro.innerHTML = "<p style='text-align:center; padding:40px; color:#888;'>Nenhuma informação encontrada para estes filtros.</p>";
            return;
        }

        // 5. Gerar Visual
        for (const esc in grupos) {
            const seccao = document.createElement('div');
            
            seccao.innerHTML = `
                <div class="escalao-header">
                    <span style="font-weight:800; font-size:0.9rem; letter-spacing:0.5px;">${esc.toUpperCase()} <small style="color:#888; font-weight:400; margin-left:10px;">(${grupos[esc].length} Atletas)</small></span>
                    <span class="seta">▼</span>
                </div>
                <div class="escalao-content">
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
                                        const pago = (a.pagamentos && a.pagamentos[`mes_${i}`]) === true;
                                        return `<td><input type="checkbox" class="check-pag" data-id="${a.id}" data-mes="mes_${i}" ${pago ? 'checked' : ''}></td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Lógica do Acordeão
            const header = seccao.querySelector('.escalao-header');
            const content = seccao.querySelector('.escalao-content');
            header.onclick = () => {
                const isOpen = content.style.display === "block";
                content.style.display = isOpen ? "none" : "block";
                header.querySelector('.seta').style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
            };

            // Lógica do Checkbox (Salvar automático)
            seccao.querySelectorAll('.check-pag').forEach(input => {
                input.onchange = async (e) => {
                    const id = e.target.dataset.id;
                    const mes = e.target.dataset.mes;
                    const valor = e.target.checked;
                    
                    try {
                        const ref = doc(db, "atletas", id);
                        await updateDoc(ref, { [`pagamentos.${mes}`]: valor });
                    } catch (err) {
                        alert("Erro ao salvar pagamento.");
                        e.target.checked = !valor; // Reverte em caso de erro
                    }
                };
            });

            listaFinanceiro.appendChild(seccao);
        }

    } catch (e) { console.error(e); }
}

filtroEscalao.onchange = carregarFinanceiro;
filtroStatus.onchange = carregarFinanceiro;
carregarFinanceiro();
