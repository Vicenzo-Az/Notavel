<?php
include_once 'User.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $user = new User();
    if ($user->register($username, $password)) {
        echo "Usuário registrado com sucesso!";
    } else {
        echo "Erro ao registrar usuário.";
    }
}
?>