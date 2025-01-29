// login.js
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.text();

        if (result.trim() === 'success') {
            window.location.href = 'index.php';
        } else {
            errorMessage.textContent = result;
        }
    } catch (error) {
        errorMessage.textContent = 'Erro ao fazer login. Tente novamente mais tarde.';
    }
});