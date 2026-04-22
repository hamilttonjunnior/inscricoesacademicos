import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarDados() {
    try {
        console.log("Tentando conectar ao Firebase...");
        
        // Busca Atletas
        const queryAtletas = await getDocs(collection(db, "atletas"));
        document.getElementById('count-atletas').innerText = queryAtletas.size;
        
        // Busca Treinadores
        const queryTreinadores = await getDocs(collection(db, "treinadores"));
        document.getElementById('count-treinadores').innerText = queryTreinadores.size;

        console.log("Sucesso: " + queryAtletas.size + " atletas encontradas.");
    } catch (error) {
        console.error("Erro detalhado:", error);
        // Se der erro, o número ficará com um "!" para você saber que falhou
        document.getElementById('count-atletas').innerText = "!";
        document.getElementById('count-treinadores').innerText = "!";
    }
}

carregarDados();

// Adiciona isto no topo ou no final de cada ficheiro JS
if (localStorage.getItem('viana_auth') !== 'true') {
    window.location.href = 'login.html';
}
