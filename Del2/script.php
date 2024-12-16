<?php
//cors
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// koble til og lage databasen
$servername = "localhost";
$username = "root";
$password = "root";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "CREATE DATABASE IF NOT EXISTS del2DB";
if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating database: " . $conn->error;
}

// lage tabellen for drikke
$sql = "CREATE TABLE IF NOT EXISTS del2DB.drikke (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    navn VARCHAR(30) NOT NULL,
    pris INT(8) NOT NULL,
    tillegg JSON NOT NULL
)";

if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating table: " . $conn->error;
}

// lage tabellen for tillegg
$sql = "CREATE TABLE IF NOT EXISTS del2DB.tillegg (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    navn VARCHAR(30) NOT NULL,
    pris INT(8) NOT NULL
)";

if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating table: " . $conn->error;
}


// lage tabellen for ordre
$sql = "CREATE TABLE IF NOT EXISTS del2DB.ordre (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    totalpris INT(8) NOT NULL,
    varer JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating table: " . $conn->error;
}


// class for tillegg med navn og pris
class tillegg
{
    private string $navn;
    private float $pris;

    public function __construct(string $navn, float $pris)
    {
        $this->navn = $navn;
        $this->pris = $pris;
    }

    public function getName(): string
    {
        return $this->navn;
    }

    public function getPrice(): float
    {
        return $this->pris;
    }
}

// class for drikke med navn, pris og tillegg fra classen over
class Drikke
{
    private string $navn;
    private float $pris;
    private array $tillegg = [];

    public function __construct(string $navn, float $pris)
    {
        $this->navn = $navn;
        $this->pris = $pris;
    }

    public function nytillegg(string $navn, float $pris)
    {
        $this->tillegg[] = new tillegg($navn, $pris);
    }

    public function getName(): string
    {
        return $this->navn;
    }

    public function getPrice(): float
    {
        return $this->pris;
    }

    public function getTillegg(): array
    {
        return $this->tillegg;
    }
}


$requestMethod = $_SERVER['REQUEST_METHOD'];



if ($requestMethod === 'POST') {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);

    $total = isset($decoded['total']) ? $decoded['total'] : 0;
    $data = isset($decoded['order']) ? $decoded['order'] : [];

    // validering
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON input', 'error' => json_last_error_msg()]);
        exit();
    }

    // Sjekke om tom ordre
    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['message' => 'Man kan ikke registrere en tom ordre']);
        exit();
    }

    // Sjekke at alt har navn og pris
    foreach ($data as $product) {
        if (empty($product['name']) || empty($product['price'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Man kan ikke registrere et produkt uten pris og navn']);
            exit();
        }

        // sjekke tillegg
        foreach ($product['tillegg'] as $addon) {
            if (empty($addon['name'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Man kan ikke registrere et tillegg uten navn']);
                exit();
            }
        }
    }

    $sql = "INSERT INTO del2DB.ordre (totalpris, varer) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $jsonItems = json_encode($data);

    $stmt->bind_param("ds", $total, $jsonItems);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Ordre registrert med suksess']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error saving order', 'error' => $stmt->error]);
    }

    $stmt->close();
}
