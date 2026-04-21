import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarContagens() {
    try {
        // Conta Atletas
        const snapshotAtletas = await getDocs(collection(db, "atletas"));
        document.getElementById('total-atletas').innerText = snapshotAtletas.size;

        // Conta Treinadores
        const snapshotTreinadores = await getDocs(collection(db, "treinadores"));
        document.getElementById('total-treinadores').innerText = snapshotTreinadores.size;

        // Status simples do financeiro
        document.getElementById('status-financeiro').innerText = "Ver Detalhes";

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

carregarContagens();
