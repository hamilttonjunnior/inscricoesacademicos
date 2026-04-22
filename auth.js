const USERS = {
    "diogo": "viana2026",      // Senha do Diogo
    "carlos": "direcao2026",   // Senha do Carlos
    "secretario1": "sec123",   // Senha do Secretário 1
    "secretario2": "sec456"    // Senha do Secretário 2
};

const form = document.getElementById('form-login');
if (form) {
    form.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('user-select').value;
        const pass = document.getElementById('password').value;

        if (USERS[user] === pass) {
            // Guarda que o utilizador está logado por 24 horas
            localStorage.setItem('viana_auth', 'true');
            localStorage.setItem('viana_user', user);
            window.location.href = 'index.html';
        } else {
            document.getElementById('error-msg').style.display = 'block';
        }
    };
}

// Função para proteger as páginas
function verificarAcesso() {
    const isLoginPage = window.location.pathname.includes('login.html');
    const isAuthenticated = localStorage.getItem('viana_auth') === 'true';

    if (!isAuthenticated && !isLoginPage) {
        window.location.href = 'login.html';
    }
}

// Executa a proteção
verificarAcesso();
