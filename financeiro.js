// financeiro.js
import { db } from './database.js';
import { collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * FUNÇÃO PRINCIPAL: Carregar lista de pagamentos
 */
async function carregarFinanceiro() {
    const listaFinanceiro = document.getElementById('lista-financeiro');
    listaFinanceiro.innerHTML = "<p>A carregar registos financeiros...</p>";

    try {
        const q = query(collection(db, "atletas"), orderBy("nome", "asc"));
        const snapshot = await getDocs(q);
        
        const hoje = new Date();
        const diaAtual = hoje.getDate();
        // Nome do mês atual em português para o título
        const mesAtual = hoje.toLocaleString('pt-PT', { month: 'long' });

        listaFinanceiro.innerHTML = `<h3>Mensalidades de ${mesAtual}</h3>`;

        if (snapshot.empty) {
            listaFinanceiro.innerHTML += "<p>Nenhuma atleta encontrada para cobrança.</p>";
            return;
        }

        snapshot.forEach(res => {
            const atleta = res.data();
            const id = res.id;

            // LÓGICA DE COBRANÇA
            const isento = atleta.isento === "true"; 
            const pago = atleta.status_pagamento === true;
            const atrasado = !pago && !isento && diaAtual > 10;

            // Criar o elemento do card
            const card = document.createElement('div');
            card.className = 'card-atleta';

            // Aplicar cor vermelha se estiver atrasado
            if (atrasado) {
                card.style.backgroundColor = "#fff1f1";
                card.style.borderLeft = "8px solid #d32f2f";
            } else if (isento) {
                card.style.borderLeft = "8px solid #9e9e9e"; // Cor cinza para isentos
            } else if (pago) {
                card.style.borderLeft = "8px solid #28a745"; // Verde para pago
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h4 style="margin: 0; color: #002366;">${atleta.nome}</h4>
                        <small>Escalão: ${atleta.escalao} | <strong>${isento ? 'ISENTO' : 'Valor: 20.00€'}</strong></small>
                    </div>
                    
                    <div>
                        ${isento ? 
                            '<span style="color: #666; font-weight: bold;">[Treinador/Atleta]</span>' : 
                            `<button id="btn-${id}" 
                                     style="background-color: ${pago ? '#6c757d' : '#28a745'}; padding: 8px 15px; width: auto; font-size: 0.85rem;">
                                     ${pago ? 'Pago ✓' : 'Marcar como Pago'}
                             </button>`
                        }
                    </div>
                </div>
            `;

            // Adicionar evento ao botão (apenas se não for isento)
            if (!isento) {
                const btn = card.querySelector(`#btn-${id}`);
                btn.addEventListener('click', async () => {
                    const novoStatus = !pago; // Inverte o status atual
                    await alternarPagamento(id, novoStatus);
                });
            }

            listaFinanceiro.appendChild(card);
        });

    } catch (error) {
        console.error("Erro no financeiro:", error);
        listaFinanceiro.innerHTML = "<p>Erro ao carregar dados financeiros.</p>";
    }
}

/**
 * FUNÇÃO PARA ATUALIZAR PAGAMENTO NO FIREBASE
 */
async function alternarPagamento(id, novoStatus) {
    try {
        const atletaRef = doc(db, "atletas", id);
        await updateDoc(atletaRef, {
            status_pagamento: novoStatus
        });
        // Recarrega a lista para atualizar as cores e botões
        carregarFinanceiro();
    } catch (error) {
        console.error("Erro ao atualizar pagamento:", error);
        alert("Não foi possível atualizar o pagamento.");
    }
}

// Iniciar
carregarFinanceiro();
