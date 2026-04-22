import { db } from './database.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarFinanceiro() {
    const lista = document.getElementById('lista-financeiro');
    const snapshot = await getDocs(collection(db, "atletas"));
    const hoje = new Date().getDate();
    lista.innerHTML = "";

    snapshot.forEach(res => {
        const a = res.data();
        const id = res.id;
        const card = document.createElement('div');
        card.className = 'card-atleta';
        
        // Lógica de Cor: Se passou do dia 10 e não pagou (e não é isento)
        const faltaPagar = !a.status_pagamento && hoje > 10 && a.isento !== "true";
        if (faltaPagar) card.style.backgroundColor = "#ffebee";
        if (a.isento === "true") card.style.borderLeftColor = "#9e9e9e";

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3>${a.nome}</h3>
                    <p>Escalão: ${a.escalao} | ${a.isento === "true" ? "ISENTO" : "20€"}</p>
                </div>
                <div>
                    ${a.isento === "true" ? '<span>-</span>' : `
                        <button onclick="marcarPago('${id}', ${!a.status_pagamento})" style="background:${a.status_pagamento ? '#6c757d' : '#28a745'}">
                            ${a.status_pagamento ? 'Pago ✓' : 'Marcar Pago'}
                        </button>
                    `}
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}

window.marcarPago = async (id, status) => {
    await updateDoc(doc(db, "atletas", id), { status_pagamento: status });
    carregarFinanceiro();
};

carregarFinanceiro();
