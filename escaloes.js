import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * FUNÇÃO PRINCIPAL: Carregar e Organizar Equipas
 * Esta função lê escalões, treinadores e atletas e faz o cruzamento de dados.
 */
async function renderizarEscaloes() {
    const container = document.getElementById('container-escaloes');
    container.innerHTML = "<p>A organizar equipas... Por favor, aguarde.</p>";

    try {
        // 1. Busca todos os dados necessários em paralelo
        const [snapEsc, snapAtle, snapTrein] = await Promise.all([
            getDocs(collection(db, "escaloes")),
            getDocs(collection(db, "atletas")),
            getDocs(collection(db, "treinadores"))
        ]);

        const listaAtletas = snapAtle.docs.map(d => d.data());
        const listaTreinadores = snapTrein.docs.map(d => d.data());

        container.innerHTML = ""; // Limpa o carregamento

        if (snapEsc.empty) {
            container.innerHTML = "<p>Nenhum escalão criado. Vá à página de Treinadores para começar.</p>";
            return;
        }

        // 2. Para cada escalão, cria uma "caixa" (Accordion)
        snapEsc.forEach(docEsc => {
            const nomeEsc = docEsc.data().nome;

            // Filtra treinador vinculado a este escalão
            const treinador = listaTreinadores.find(t => t.escalao === nomeEsc);
            const nomeTreinador = treinador ? treinador.nome : "Sem treinador atribuído";

            // Filtra atletas vinculadas a este escalão
            const atletasNoEscalao = listaAtletas.filter(a => a.escalao === nomeEsc);

            // 3. Estrutura HTML do Accordion
            const accordionDiv = document.createElement('div');
            accordionDiv.className = 'accordion';

            accordionDiv.innerHTML = `
                <div class="accordion-header">
                    <div style="display:flex; flex-direction:column">
                        <span style="font-size: 1.1rem; color: #002366;">${nomeEsc}</span>
                        <small style="color: #666;">Treinador: ${nomeTreinador}</small>
                    </div>
                    <span style="font-size: 0.8rem; background: #eee; padding: 2px 8px; border-radius: 10px;">
                        ${atletasNoEscalao.length} Atletas
                    </span>
                </div>
                <div class="accordion-content">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 2px solid #ddd; font-size: 0.85rem;">
                                <th style="padding: 8px;">Nome da Atleta</th>
                                <th style="padding: 8px;">Contacto</th>
                            </tr>
                        </thead>
                        <tbody id="lista-corpo-${docEsc.id}">
                            ${atletasNoEscalao.map(a => `
                                <tr style="border-bottom: 1px solid #eee; font-size: 0.9rem;">
                                    <td style="padding: 8px;">${a.nome}</td>
                                    <td style="padding: 8px;">${a.telefone}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${atletasNoEscalao.length === 0 ? '<p style="text-align:center; color:#999; margin-top:10px;">Nenhuma atleta inscrita neste escalão.</p>' : ''}
                </div>
            `;

            // 4. Lógica de abrir e fechar (Toggle)
            accordionDiv.querySelector('.accordion-header').addEventListener('click', () => {
                // Fecha outros se quiser (opcional), ou apenas alterna este:
                accordionDiv.classList.toggle('active');
            });

            container.appendChild(accordionDiv);
        });

    } catch (error) {
        console.error("Erro ao carregar escalões:", error);
        container.innerHTML = "<p>Ocorreu um erro ao carregar os dados.</p>";
    }
}

// Inicia a renderização
renderizarEscaloes();
