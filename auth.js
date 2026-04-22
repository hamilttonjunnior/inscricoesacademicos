const USERS = {
    "diogo": "viana2026",      
    "carlos": "direcao2026",   
    "secretario1": "sec123",   
    "secretario2": "sec456"    
};

// --- LÓGICA DE LOGIN ---
const form = document.getElementById('form-login');
if (form) {
    form.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('user-select').value;
        const pass = document.getElementById('password').value;

        if (USERS[user] === pass) {
            localStorage.setItem('viana_auth', 'true');
            localStorage.setItem('viana_user', user);
            
            if (user.includes('secretario')) {
                window.location.href = 'financeiro.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            const errorMsg = document.getElementById('error-msg');
            if (errorMsg) errorMsg.style.display = 'block';
        }
    };
}

// --- PROTEÇÃO DE PÁGINAS E PERMISSÕES ---
function verificarAcesso() {
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';
    const userLogado = localStorage.getItem('viana_user');

    if (!isAuthenticated && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    if (isAuthenticated && userLogado && userLogado.includes('secretario')) {
        const proibidas = ['index.html', 'treinadores.html', 'atletas.html'];
        const tentandoEntrarProibida = proibidas.some(p => path.includes(p));

        if (tentandoEntrarProibida) {
            window.location.href = 'financeiro.html';
        }

        document.addEventListener('DOMContentLoaded', () => {
            const links = document.querySelectorAll('nav a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (proibidas.includes(href)) {
                    link.style.display = 'none';
                }
            });
        });
    }
}

// --- NOVA LÓGICA DO BOTÃO SAIR (MAIS FORTE) ---
// Usamos o 'window.onclick' para capturar o clique mesmo que o JS do dashboard carregue depois
window.onclick = function(event) {
    // Verifica se o que foi clicado é o botão sair ou está dentro dele
    const btn = event.target.closest('#btn-logout');
    if (btn) {
        event.preventDefault();
        console.log("Sessão encerrada pelo utilizador.");
        localStorage.clear();
        window.location.href = 'login.html';
    }
};

verificarAcesso();
