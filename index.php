<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit();
}

include_once 'Database.php';
$db = new Database();
$conn = $db->getConnection();

$userId = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT profile_photo FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$profilePhoto = $user && $user['profile_photo'] ? 'uploads/' . $user['profile_photo'] : 'uploads/default-profile.png';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Metadados da página -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notável - Escreva o extraordinário</title>

    <!-- Link para o arquivo de estilos CSS -->
    <link rel="stylesheet" href="styles.css">

    <!-- Inclusão de scripts JavaScript -->
    <script defer src="script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
</head>
<body>
    <!-- Página principal da aplicação -->
    <div class="main-container">
        <!-- Cabeçalho da aplicação -->
        <header class="main-header">
            <div class="header-left">
                <h1 id="app-name">Notável</h1>
            </div>
            <div class="header-right">
                <!-- Botão de configurações da conta -->
                <button id="account-button" class="profile-circle">
                    <img src="<?php echo $profilePhoto; ?>" id="current-photo" style="width: 100%; height: 100%; border-radius: 50%;">
                </button>
            </div>
        </header>

        <div class="content">
            <!-- Sidebar de notas -->
            <aside id="notes-sidebar">
                <div class="notes-toolbar">
                    <!-- Botões para interação com a sidebar -->
                    <button id="menu-button">☰</button>
                    <button id="search-button">🔍</button>
                    <button id="new-note-button">＋</button>
                </div>
                <div id="menu-options" class="menu-options hidden">
                    <!-- Opções do menu -->
                    <button id="save-option">Salvar</button>
                    <button id="import-option">Importar</button>
                    <button id="duplicate-option">Duplicar</button>
                    <button id="export-option">Exportar em PDF</button>
                </div>                
                <div class="note-list">
                    <!-- Itens de notas existentes -->
                    <!-- As notas serão carregadas dinamicamente pelo script.js -->
                </div>
            </aside>

            <!-- Popup de configurações da conta -->
            <div class="account-popup hidden">
                <div class="popup-content">
                    <h3>Configurações de Conta</h3>
                    <form id="photo-form" enctype="multipart/form-data">
                        <div class="popup-option">
                            <input type="file" id="profile-photo" name="profile_photo" accept="image/*" style="display: none;">
                            <button type="button" id="change-photo-btn">Trocar Foto de Perfil</button>
                            <img src="<?php echo $profilePhoto; ?>" id="current-photo-popup" style="width: 100px; height: 100px; border-radius: 50%; margin-top: 10px;">
                        </div>
                    </form>
                    <form id="user-settings-form">
                        <div class="popup-option">
                            <button type="button" id="change-name-password-btn">Trocar Nome e Senha</button>
                        </div>
                        <div id="name-password-fields" class="hidden">
                            <div class="popup-option">
                                <label for="new-username">Novo nome de usuário:</label>
                                <input type="text" id="new-username" name="new_username" placeholder="Novo nome de usuário">
                            </div>
                            <div class="popup-option">
                                <label for="new-password">Nova senha:</label>
                                <input type="password" id="new-password" name="new_password" placeholder="Nova senha">
                            </div>
                            <div class="popup-option">
                                <label for="confirm-password">Confirmar senha:</label>
                                <input type="password" id="confirm-password" name="confirm_password" placeholder="Confirmar senha">
                            </div>
                            <div class="popup-option">
                                <button type="button" id="save-name-password-btn">Salvar</button>
                            </div>
                        </div>
                    </form>
                    <div class="popup-option">
                        <button id="logout-btn">Logoff</button>
                    </div>
                    <button class="close-popup-btn">Fechar</button>
                </div>
            </div>            

            <!-- Editor de notas -->
            <section id="note-editor" class="hidden">
                <input type="text" id="note-title" placeholder="Título da Nota">
                <textarea id="note-body" placeholder="Digite aqui..."></textarea>
                <button id="save-note-button">Salvar</button>
            </section>

            <!-- Placeholder para quando nenhuma nota estiver selecionada -->
            <section id="note-placeholder">
                <p>Selecione ou crie uma nota para começar.</p>
            </section>
        </div>
    </div>
</body>
</html>
