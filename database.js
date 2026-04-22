import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBHAhZ0eJHa62iZq1rrfLP_D8elQjecgkA", // Sua chave
    authDomain: "inscricoes-3e146.firebaseapp.com",
    projectId: "inscricoes-3e146",
    storageBucket: "inscricoes-3e146.firebasestorage.app",
    messagingSenderId: "26884268139",
    appId: "1:268842681639:web:86ae08bde2785b249f9502"
};

const app = initializeApp(firebaseConfig);
// O comando 'export' é VITAL para o dashboard.js funcionar
export const db = getFirestore(app);
