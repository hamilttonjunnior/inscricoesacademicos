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

    if (!isAuthenticated && !path.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    if (isAuthenticated && userLogado && userLogado.includes('secretario')) {
        const paginasProibidas = ['index.html', 'treinadores.html', 'atletas.html'];

        if (paginasProibidas.some(p => path.includes(p))) {
            window.location.href = 'financeiro.html';
            return;
        }

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

        const limparMenu = () => {
            const links = document.querySelectorAll('nav a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && paginasProibidas.some(p => href.includes(p))) {
                    link.remove();
                }
            });
        };

        limparMenu();
        document.addEventListener('DOMContentLoaded', limparMenu);
    }
}

// --- 3. BARRA DE UTILIZADOR LOGADO ---
function adicionarBarraUsuario() {
    const userLogado = localStorage.getItem('viana_user');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';
    const isLoginPage = window.location.pathname.includes('login.html');

    // Só executa se estiver logado e não for a página de login
    if (isAuthenticated && userLogado && !isLoginPage) {
        
        const verificarHeader = setInterval(() => {
            const header = document.querySelector('header');
            
            if (header) {
                clearInterval(verificarHeader);
                
                if (document.getElementById('barra-user-logado')) return;

                const userBar = document.createElement('div');
                userBar.id = 'barra-user-logado';
                
                // Estilos Inline para garantir prioridade
                userBar.style.backgroundColor = "#f9f9f9";
                userBar.style.borderBottom = "1px solid #eee";
                userBar.style.padding = "6px 5%";
                userBar.style.textAlign = "right";
                userBar.style.fontSize = "11px";
                userBar.style.color = "#666";
                userBar.style.textTransform = "uppercase";
                userBar.style.fontFamily = "sans-serif";
                userBar.style.display = "block";

                userBar.innerHTML = `Sessão ativa: <strong style="color: #000;">${userLogado}</strong>`;

                header.insertAdjacentElement('afterend', userBar);
                console.log("Barra de utilizador injetada para:", userLogado);
            }
        }, 100);

        setTimeout(() => clearInterval(verificarHeader), 5000);
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

// --- INICIALIZAÇÃO ---
gerirPermissoes();

// Força a execução da barra
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    adicionarBarraUsuario();
} else {
    document.addEventListener('DOMContentLoaded', adicionarBarraUsuario);
}
