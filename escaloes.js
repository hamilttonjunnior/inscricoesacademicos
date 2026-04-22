import { db } from './database.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('container-escaloes');

async function carregarEscaloesComplexo() {
    try {
        if (!container) return;

        // Busca todos os dados
        const snapEsc = await getDocs(query(collection(db, "escaloes"), orderBy("nome", "asc")));
        const snapAtl = await getDocs(collection(db, "atletas"));
        const snapTre = await getDocs(collection(db, "treinadores"));

        const todasAtletas = snapAtl.docs.map(d => d.data());
        const todosTreinadores = snapTre.docs.map(d => d.data());

        container.innerHTML = "";

        if (snapEsc.empty) {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>Crie escalões na página de Treinadores primeiro.</p>";
            return;
        }

        snapEsc.forEach(docEsc => {
            const nomeEscalao = docEsc.data().nome;

            // Filtra quem é deste escalão
            const treinador = todosTreinadores.find(t => t.escalao === nomeEscalao);
            const atletasDesteEscalao = todasAtletas.filter(a => a.escalao === nomeEscalao);

            const card = document.createElement('div');
            card.className = 'accordion'; 
            
            card.innerHTML = `
                <div class="accordion-header">
                    <div>
                        <span style="font-weight: 800; font-size: 1.1rem; color: #1a1a1a;">${nomeEscalao}</span>
                        <small style="margin-left: 10px; color: #888; font-weight: 600;">(${atletasDesteEscalao.length} Atletas)</small>
                    </div>
                    <span style="font-size: 0.7rem; font-weight: 800; color: #333;">ABRIR ▼</span>
                </div>
                <div class="accordion-content">
                    <div style="background: #fafafa; padding: 15px; border-radius: 4px; border: 1px solid #eee; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Treinador Responsável</h4>
                        ${treinador ? `
                            <p style="margin: 0; font-weight: 700; color: #1a1a1a;">${treinador.nome}</p>
                            <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #555;">
                                <strong>Licença:</strong> ${treinador.licenca || '---'} | 
                                <strong>Telefone:</strong> ${treinador.telefone}
                            </p>
                        ` : '<p style="margin:0; font-size:0.85rem; color:#bbb; font-style:italic;">Nenhum treinador atribuído.</p>'}
                    </div>

                    <h4 style="margin: 0 0 10px 0; font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Lista de Atletas</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 2px solid #eee;">
                                <th style="padding: 8px 5px;">Nome</th>
                                <th style="padding: 8px 5px;">Telemóvel</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${atletasDesteEscalao.length > 0 ? 
                                atletasDesteEscalao.map(a => `
                                    <tr style="border-bottom: 1px solid #f9f9f9;">
                                        <td style="padding: 10px 5px; font-weight: 500;">${a.nome}</td>
                                        <td style="padding: 10px 5px; color: #666;">${a.telefone}</td>
                                    </tr>
                                `).join('') 
                                : '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #ccc;">Nenhuma atleta inscrita neste escalão.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;

            // Lógica para Expandir/Minimizar
            card.querySelector('.accordion-header').onclick = () => {
                card.classList.toggle('active');
            };

            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro ao montar escalões:", e);
        if(container) container.innerHTML = "<p>Erro ao processar dados.</p>";
    }
}

carregarEscaloesComplexo();
