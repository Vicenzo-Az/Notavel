<?php
include 'File.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    die("Acesso negado.");
}

$userId = $_SESSION['user_id'];
$file = new File();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($file->upload($userId, $_FILES['file'])) {
        echo "Arquivo enviado com sucesso!";
    } else {
        echo "Erro ao enviar arquivo.";
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($file->getFiles($userId));
}
?>