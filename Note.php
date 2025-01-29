<?php
include_once 'Database.php';

class Note {
    private $conn;
    private $table_name = "notes";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        if (!$this->conn) {
            throw new Exception("Erro de conexão com o banco de dados");
        }
    }

    public function create($userId, $title, $content) {
        try {
            $query = "INSERT INTO " . $this->table_name . " (user_id, title, content) VALUES (:user_id, :title, :content)";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":content", $content);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Create Error: " . $e->getMessage());
            return false;
        }
    }

    public function read($userId) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Read Error: " . $e->getMessage());
            return [];
        }
    }

    public function update($userId, $noteId, $title, $content) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                     SET title = :title, content = :content, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":content", $content);
            $stmt->bindParam(":id", $noteId);
            $stmt->bindParam(":user_id", $userId);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Update Error: " . $e->getMessage());
            return false;
        }
    }

    public function delete($userId, $noteId) {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":id", $noteId);
            $stmt->bindParam(":user_id", $userId);

            return $stmt->execute();
        } catch(PDOException $e) {
            error_log("Delete Error: " . $e->getMessage());
            return false;
        }
    }
}
?>