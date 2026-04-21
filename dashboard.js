import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarResumo() {
    try {
        const querySnapshot = await getDocs(collection(db, "atletas"));
        const total = querySnapshot.size; // Conta quantos documentos existem na coleção
        
        document.getElementById('total-atletas').innerText = total;

        // Por enquanto deixamos o financeiro como 0 até criarmos a lógica
        document.getElementById('total-pendente').innerText = "Verificar";

    } catch (error) {
        console.error("Erro ao carregar resumo:", error);
    }
}

carregarResumo();