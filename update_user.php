<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    die('Acesso negado');
}

include_once 'Database.php';

$userId = $_SESSION['user_id'];
$username = $_POST['username'] ?? null;
$password = $_POST['password'] ?? null;

$db = new Database();
$conn = $db->getConnection();

try {
    $updates = [];
    $params = [];

    if ($username) {
        $updates[] = "username = ?";
        $params[] = $username;
    }

    if ($password) {
        $updates[] = "password = ?";
        $params[] = password_hash($password, PASSWORD_DEFAULT);
    }

    if (empty($updates)) {
        die('Nenhuma alteração solicitada');
    }

    $params[] = $userId;
    $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute($params)) {
        echo "Dados atualizados com sucesso!";
    } else {
        echo "Erro ao atualizar dados";
    }
} catch (PDOException $e) {
    echo "Erro ao atualizar dados: " . $e->getMessage();
}
?>
