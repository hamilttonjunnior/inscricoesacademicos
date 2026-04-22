const USERS = {
    "diogo": "viana2026",      
    "carlos": "direcao2026",   
    "secretario1": "sec123",   
    "secretario2": "sec456"    
};

// 1. Lógica de Login
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

// 2. Proteção de Acesso e Limpeza do Menu
function gerirPermissoes() {
    const userLogado = localStorage.getItem('viana_user');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';
    const path = window.location.pathname;

    if (!isAuthenticated && !path.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    if (userLogado && userLogado.includes('secretario')) {
        const proibidas = ['index.html', 'treinadores.html', 'atletas.html'];
        
        // Se tentar entrar na URL na mão, expulsa
        if (proibidas.some(p => path.includes(p))) {
            window.location.href = 'financeiro.html';
        }

        // ESCONDER IMEDIATAMENTE (Via CSS dinâmico)
        const style = document.createElement('style');
        style.innerHTML = `
            nav a[href="index.html"], 
            nav a[href="treinadores.html"], 
            nav a[href="atletas.html"] { 
                display: none !important; 
            }
        `;
        document.head.appendChild(style);

        // REMOVER DO DOM (Para segurança extra após carregar)
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('nav a').forEach(link => {
                if (proibidas.some(p => link.getAttribute('href')?.includes(p))) {
                    link.remove();
                }
            });
        });
    }
}

// 3. Lógica do Botão Sair (Delegada para funcionar sempre)
window.addEventListener('click', (e) => {
    const btn = e.target.closest('#btn-logout');
    if (btn) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    }
});

gerirPermissoes();
