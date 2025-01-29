const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);

    try {
        const response = await fetch('register.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.text();

        if (result.trim() === 'Usuário registrado com sucesso!') {
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = result;
        }
    } catch (error) {
        errorMessage.textContent = 'Erro ao registrar. Tente novamente mais tarde.';
    }
});
