const USERS = {
    "diogo": "viana2026",      
    "carlos": "direcao2026",   
    "secretario1": "sec123",   
    "secretario2": "sec456"    
};

// --- 1. LÓGICA DE LOGIN ---
const form = document.getElementById('form-login');
if (form) {
    form.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('user-select').value;
        const pass = document.getElementById('password').value;

        if (USERS[user] === pass) {
            localStorage.setItem('viana_auth', 'true');
            localStorage.setItem('viana_user', user);
            
            // Redirecionamento inicial
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

// --- 2. PROTEÇÃO DE ACESSO E ESCONDER MENU ---
function gerirPermissoes() {
    const path = window.location.pathname;
    const userLogado = localStorage.getItem('viana_user');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';

    // Se não estiver logado, manda para o login
    if (!isAuthenticated && !path.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Se for Secretário, aplicamos o bloqueio total
    if (userLogado && userLogado.includes('secretario')) {
        const paginasProibidas = ['index.html', 'treinadores.html', 'atletas.html'];

        // Bloqueio de URL (Segurança)
        if (paginasProibidas.some(p => path.includes(p))) {
            window.location.href = 'financeiro.html';
            return;
        }

        // ESCONDER IMEDIATAMENTE VIA CSS (Agressivo)
        const cssRestrito = `
            nav a[href="index.html"], 
            nav a[href="treinadores.html"], 
            nav a[href="atletas.html"],
            .btn-link[href="atletas.html"], 
            a[href="treinadores.html"] { 
                display: none !important; 
                visibility: hidden !important;
                pointer-events: none !important;
            }
        `;
        
        const styleSheet = document.createElement("style");
        styleSheet.innerText = cssRestrito;
        document.head.appendChild(styleSheet);

        // REMOVER FISICAMENTE DO MENU
        const limparMenu = () => {
            const links = document.querySelectorAll('nav a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (paginasProibidas.includes(href)) {
                    link.remove();
                }
            });
        };

        limparMenu();
        document.addEventListener('DOMContentLoaded', limparMenu);
    }
}

// --- 3. BARRA DE UTILIZADOR LOGADO (ABAIXO DO HEADER) ---
function adicionarBarraUsuario() {
    const userLogado = localStorage.getItem('viana_user');
    const header = document.querySelector('header');
    const isLoginPage = window.location.pathname.includes('login.html');

    if (userLogado && header && !isLoginPage) {
        const userBar = document.createElement('div');
        
        // Estilo discreto
        userBar.style.backgroundColor = "#fdfdfd";
        userBar.style.borderBottom = "1px solid #eee";
        userBar.style.padding = "4px 5%";
        userBar.style.textAlign = "right";
        userBar.style.fontSize = "11px";
        userBar.style.color = "#777";
        userBar.style.textTransform = "uppercase";

        userBar.innerHTML = `Utilizador: <strong style="color: #000;">${userLogado}</strong>`;

        header.insertAdjacentElement('afterend', userBar);
    }
}

// --- 4. BOTÃO SAIR ---
window.addEventListener('click', (e) => {
    const btn = e.target.closest('#btn-logout');
    if (btn) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    }
});

// Inicialização
gerirPermissoes();
document.addEventListener('DOMContentLoaded', adicionarBarraUsuario);
