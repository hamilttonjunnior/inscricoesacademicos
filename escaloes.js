import { db } from './database.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById('lista-escaloes-complexa');

async function carregarVisaoGeral() {
    try {
        // 1. Procurar todos os dados necessários
        const snapEscaloes = await getDocs(query(collection(db, "escaloes"), orderBy("nome", "asc")));
        const snapAtletas = await getDocs(collection(db, "atletas"));
        const snapTreinadores = await getDocs(collection(db, "treinadores"));

        const atletas = snapAtletas.docs.map(d => d.data());
        const treinadores = snapTreinadores.docs.map(d => d.data());

        container.innerHTML = "";

        if (snapEscaloes.empty) {
            container.innerHTML = "<p style='text-align:center; color:#888;'>Nenhum escalão configurado na página de Treinadores.</p>";
            return;
        }

        // 2. Para cada escalão, criar a box minimizada
        snapEscaloes.forEach(docEsc => {
            const nomeEscalao = docEsc.data().nome;

            // Filtrar quem pertence a este escalão
            const treinadorResponsavel = treinadores.find(t => t.escalao === nomeEscalao);
            const atletasDoGrupo = atletas.filter(a => a.escalao === nomeEscalao);

            const card = document.createElement('div');
            card.className = 'accordion'; // Usa o mesmo estilo de caixa da lista de atletas
            
            card.innerHTML = `
                <div class="accordion-header">
                    <div>
                        <strong style="font-size: 1.1rem;">${nomeEscalao}</strong>
                        <span style="margin-left: 10px; color: #888; font-size: 0.8rem;">
                            (${atletasDoGrupo.length} Atletas)
                        </span>
                    </div>
                    <span>ABRIR GRUPO ▼</span>
                </div>
                <div class="accordion-content">
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 10px; font-size: 0.8rem; color: #555;">TREINADOR / RESPONSÁVEL</h3>
                        ${treinadorResponsavel ? `
                            <p style="margin: 0; font-weight: 700;">${treinadorResponsavel.nome}</p>
                            <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #666;">
                                Licença: ${treinadorResponsavel.licenca || 'N/A'} | Tel: ${treinadorResponsavel.telefone}
                            </p>
                        ` : '<p style="color: #999; font-style: italic; margin: 0;">Nenhum treinador atribuído.</p>'}
                    </div>

                    <h3 style="font-size: 0.8rem; color: #555; margin-bottom: 10px;">LISTA DE ATLETAS</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead style="text-align: left; border-bottom: 2px solid #eee;">
                            <tr>
                                <th style="padding: 10px 5px;">Nome</th>
                                <th style="padding: 10px 5px;">Telemóvel</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${atletasDoGrupo.length > 0 ? 
                                atletasDoGrupo.map(a => `
                                    <tr style="border-bottom: 1px solid #f5f5f5;">
                                        <td style="padding: 10px 5px;">${a.nome}</td>
                                        <td style="padding: 10px 5px;">${a.telefone}</td>
                                    </tr>
                                `).join('') 
                                : '<tr><td colspan="2" style="padding: 20px; color: #999; text-align: center;">Sem atletas inscritas neste escalão.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;

            // Lógica para abrir/fechar (Minimizado por padrão)
            card.querySelector('.accordion-header').onclick = () => {
                card.classList.toggle('active');
            };

            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro na visão geral:", e);
        container.innerHTML = "<p>Erro ao carregar os grupos.</p>";
    }
}

carregarVisaoGeral();
