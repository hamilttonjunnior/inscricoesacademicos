import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * FUNÇÃO DE CONTAGEM EM TEMPO REAL
 * Esta função vai ao Firebase, conta quantos documentos existem e atualiza o ecrã.
 */
async function atualizarResumoDashboard() {
    // Referências dos elementos no index.html
    const campoAtletas = document.getElementById('count-atletas');
    const campoTreinadores = document.getElementById('count-treinadores');

    try {
        // 1. Contar Atletas
        const snapshotAtletas = await getDocs(collection(db, "atletas"));
        if (campoAtletas) {
            campoAtletas.innerText = snapshotAtletas.size; // .size retorna o número total
        }

        // 2. Contar Treinadores
        const snapshotTreinadores = await getDocs(collection(db, "treinadores"));
        if (campoTreinadores) {
            campoTreinadores.innerText = snapshotTreinadores.size;
        }

        console.log("Dashboard atualizado com sucesso!");

    } catch (error) {
        console.error("Erro ao atualizar números do dashboard:", error);
        if (campoAtletas) campoAtletas.innerText = "!";
    }
}

// Executa a função assim que a página carrega
atualizarResumoDashboard();
