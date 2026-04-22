import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * dashboard.js - Lógica de contagem e exibição de dados
 */

async function carregarDados() {
    try {
        console.log("Conectando ao banco de dados...");
        
        // 1. Busca e contagem de Atletas
        const queryAtletas = await getDocs(collection(db, "atletas"));
        const displayAtletas = document.getElementById('count-atletas');
        if (displayAtletas) {
            displayAtletas.innerText = queryAtletas.size;
        }
        
        // 2. Busca e contagem de Treinadores
        const queryTreinadores = await getDocs(collection(db, "treinadores"));
        const displayTreinadores = document.getElementById('count-treinadores');
        if (displayTreinadores) {
            displayTreinadores.innerText = queryTreinadores.size;
        }

        console.log("Dashboard atualizado com sucesso.");
        
    } catch (error) {
        console.error("Falha ao carregar métricas do Dashboard:", error);
        
        // Exibe um sinal de erro visual nos contadores
        if (document.getElementById('count-atletas')) {
            document.getElementById('count-atletas').innerText = "!";
        }
        if (document.getElementById('count-treinadores')) {
            document.getElementById('count-treinadores').innerText = "!";
        }
    }
}

// Executa a função ao carregar o script
carregarDados();
