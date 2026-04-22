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

// --- PROTEÇÃO DE ACESSO E ESCONDER MENU ---
function gerirPermissoes() {
    const path = window.location.pathname;
    const userLogado = localStorage.getItem('viana_user');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';

    // 1. Se não está logado e não é a página de login, expulsa
    if (!isAuthenticated && !path.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Se for Secretário, aplicamos as restrições
    if (userLogado && userLogado.includes('secretario')) {
        const paginasProibidas = ['index.html', 'treinadores.html', 'atletas.html'];
        
        // Bloqueio de URL (se tentar digitar o link)
        const tentandoEntrarNoQueNaoPode = paginasProibidas.some(p => path.includes(p));
        if (tentandoEntrarNoQueNaoPode) {
            window.location.href = 'financeiro.html';
            return;
        }

        // Esconder os links do menu (usamos um intervalo para garantir que o menu já existe)
        const checkMenu = setInterval(() => {
            const links = document.querySelectorAll('nav a');
            if (links.length > 0) {
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (paginasProibidas.includes(href)) {
                        link.remove(); // Remove o link completamente do código para ele não clicar sem querer
                    }
                });
                clearInterval(checkMenu); // Para de procurar quando encontrar e remover
            }
        }, 50); // Procura a cada 50ms
    }
}

// --- BOTÃO SAIR ---
window.onclick = function(event) {
    const btn = event.target.closest('#btn-logout');
    if (btn) {
        event.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    }
};

// Executar as permissões
gerirPermissoes();
