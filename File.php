<?php
include_once 'Database.php';

class File {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function upload($userId, $file) {
        $filename = $file['name'];
        $filepath = 'uploads/' . basename($filename);
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $stmt = $this->conn->prepare("INSERT INTO files (user_id, filename, filepath) VALUES (?, ?, ?)");
            return $stmt->execute([$userId, $filename, $filepath]);
        }
        return false;
    }

    public function getFiles($userId) {
        $stmt = $this->conn->prepare("SELECT * FROM files WHERE user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>