import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarEscaloes() {
    const container = document.getElementById('container-escaloes');
    const escSnap = await getDocs(collection(db, "escaloes"));
    const atlSnap = await getDocs(collection(db, "atletas"));
    const trSnap = await getDocs(collection(db, "treinadores"));

    const atletas = atlSnap.docs.map(d => d.data());
    const treinadores = trSnap.docs.map(d => d.data());

    container.innerHTML = "";

    escSnap.forEach(docEsc => {
        const nomeEsc = docEsc.data().nome;
        const treinadorResponsavel = treinadores.find(t => t.escalao === nomeEsc)?.nome || "Não definido";
        const atletasNoEscalao = atletas.filter(a => a.escalao === nomeEsc);

        const div = document.createElement('div');
        div.className = 'accordion';
        div.innerHTML = `
            <div class="accordion-header">
                <span>${nomeEsc} (${atletasNoEscalao.length} atletas)</span>
                <small>Treinador: ${treinadorResponsavel} ▼</small>
            </div>
            <div class="accordion-content">
                <ul style="list-style: none; padding: 0;">
                    ${atletasNoEscalao.map(a => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">• ${a.nome}</li>`).join('')}
                    ${atletasNoEscalao.length === 0 ? '<li>Nenhuma atleta inscrita</li>' : ''}
                </ul>
            </div>
        `;

        div.querySelector('.accordion-header').onclick = () => div.classList.toggle('active');
        container.appendChild(div);
    });
}
carregarEscaloes();
