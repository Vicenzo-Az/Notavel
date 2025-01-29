<?php
include 'Note.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    die("Acesso negado.");
}

$userId = $_SESSION['user_id'];
$note = new Note();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];
    $content = $_POST['content'];
    if ($note->create($userId, $title, $content)) {
        echo "Nota salva com sucesso!";
    } else {
        echo "Erro ao salvar nota.";
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($note->read($userId));
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $noteId = $_PUT['id'];
    $title = $_PUT['title'];
    $content = $_PUT['content'];
    if ($note->update($userId, $noteId, $title, $content)) {
        echo "Nota atualizada com sucesso!";
    } else {
        echo "Erro ao atualizar nota.";
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $noteId = $_DELETE['id'];
    if ($note->delete($userId, $noteId)) {
        echo "Nota excluída com sucesso!";
    } else {
        echo "Erro ao excluir nota.";
    }
}
?>