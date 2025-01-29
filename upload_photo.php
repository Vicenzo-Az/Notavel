<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    die('Acesso negado');
}

$userId = $_SESSION['user_id'];
$uploadDir = 'uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['profile_photo'])) {
    $file = $_FILES['profile_photo'];
    $fileName = $userId . '_' . basename($file['name']);
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        include_once 'Database.php';
        $db = new Database();
        $conn = $db->getConnection();

        $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE id = ?");
        if ($stmt->execute([$fileName, $userId])) {
            $_SESSION['profile_photo'] = $fileName; // Atualiza a sessão com o novo nome do arquivo
            echo json_encode(['status' => 'success', 'fileName' => $fileName]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar foto no banco de dados']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao fazer upload da foto']);
    }
}
?>
