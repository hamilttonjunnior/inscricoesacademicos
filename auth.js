const USERS = {
    "diogo": "viana2026",      // Senha do Diogo (Admin)
    "carlos": "direcao2026",   // Senha do Carlos (Admin)
    "secretario1": "sec123",   // Senha do Secretário 1 (Restrito)
    "secretario2": "sec456"    // Senha do Secretário 2 (Restrito)
};

const form = document.getElementById('form-login');
if (form) {
    form.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('user-select').value;
        const pass = document.getElementById('password').value;

        if (USERS[user] === pass) {
            localStorage.setItem('viana_auth', 'true');
            localStorage.setItem('viana_user', user); // Aqui guardamos o nome (ex: "secretario1")
            
            // Se for secretário, mandamos direto para o Financeiro, senão vai para o Dashboard
            if (user.includes('secretario')) {
                window.location.href = 'financeiro.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            document.getElementById('error-msg').style.display = 'block';
        }
    };
}

// Função para proteger as páginas e gerir permissões
function verificarAcesso() {
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';
    const userLogado = localStorage.getItem('viana_user');

    // 1. Bloqueio de Segurança: Se não está logado e não é a página de login, expulsa
    if (!isAuthenticated && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Lógica de Permissões para Secretários
    if (isAuthenticated && userLogado && userLogado.includes('secretario')) {
        
        // Lista de páginas que o secretário NÃO pode entrar
        const proibidas = ['index.html', 'treinadores.html', 'atletas.html'];
        const tentandoEntrarProibida = proibidas.some(p => path.includes(p));

        if (tentandoEntrarProibida) {
            window.location.href = 'financeiro.html';
        }

        // Esconder os links do menu visualmente quando o HTML carregar
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

// Lógica do Botão Sair
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('viana_auth');
            localStorage.removeItem('viana_user');
            window.location.href = 'login.html';
        });
    }
});

// Executa a proteção ao carregar o ficheiro
verificarAcesso();
