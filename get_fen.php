<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root"; // Ваш MySQL користувач
$password = ""; // Пароль користувача (за замовчуванням для XAMPP це порожнє значення)
$dbname = "chess_eval";

// Створюємо з'єднання
$conn = new mysqli($servername, $username, $password, $dbname);

// Перевіряємо з'єднання
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Отримуємо випадкову FEN-позицію з таблиці
$sql = "SELECT fen, `index` FROM fens ORDER BY RAND() LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode($row);
} else {
    echo json_encode(["fen" => "", "index" => -1]);
}

$conn->close();
?>
