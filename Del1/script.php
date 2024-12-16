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

$sql = "CREATE DATABASE IF NOT EXISTS del1DB";
if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating database: " . $conn->error;
}

// lage tabellen

$sql = "CREATE TABLE IF NOT EXISTS del1DB.users (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        fornavn VARCHAR(30) NOT NULL,
        etternavn VARCHAR(30) NOT NULL,
        epost VARCHAR(50),
        telefon INT(8) NOT NULL,
        fødselsdato DATE NOT NULL

    )";

if ($conn->query($sql) === TRUE) {
} else {
    echo "Error creating table: " . $conn->error;
}


//sjekke om emailen er riktig format

function isValidEmail($email)
{
    //regex for email match
    $regex = '/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/';

    //sjekke om emailen matcher regex
    if (preg_match($regex, $email)) {
        return true;
    } else {
        return false;
    }
}


//ta imot requests
$requestMethod = $_SERVER['REQUEST_METHOD'];


// hente alle brukere hvis det er en get request
if ($requestMethod === "GET") {
    $sql = "SELECT * FROM del1DB.users";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);

        echo json_encode($data);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error executing query', 'error' => mysqli_error($conn)]);
    }
}

// lage ny hvis det er en post request
if ($requestMethod === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON', 'error' => json_last_error_msg()]);
        exit();
    }

    //få inn all formdata
    $fornavn = isset($data['fornavn']) ? $data['fornavn'] : '';
    $etternavn = isset($data['etternavn']) ? $data['etternavn'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $nummer = isset($data['nummer']) ? $data['nummer'] : '';
    $dato = isset($data['dato']) ? $data['dato'] : '';

    //liste over gyldige telefonnummer
    $nummere = [
        '91234567',
        '94876543',
        '93456789',
        '49123456',
        '97456234',
        '92123456',
        '49345678',
        '97431234',
        '93012345',
        '94234567'
    ];

    // sjekke at email har riktig format
    if (!isValidEmail($email)) {
        http_response_code(400);
        echo json_encode(['message' => 'Feil format på email']);
        exit();
    }

    //sjekke at nummeret starter på 9 eller 4
    if ($nummer[0] !== '9' && $nummer[0] !== '4') {
        http_response_code(400);
        echo json_encode(['message' => 'Nummer må begynne på 9 eller 4']);
        exit();
    }

    //sjekke at telefonnummeret er med i listen over gyldige nummer
    if (!in_array($nummer, $nummere)) {
        http_response_code(400);
        echo json_encode(['message' => 'Nummeret er ikke gyldig']);
        exit();
    }

    //sjekke om personen er eldre enn 16
    // konvertere 'DD/MM/YYYY' til 'YYYY-MM-DD'
    $fødselsdato = DateTime::createFromFormat('d/m/Y', $dato);

    $dagsdato = new DateTime();

    $alder = $dagsdato->diff($fødselsdato)->y;

    if ($alder < 16) {
        http_response_code(400);
        echo json_encode(['message' => 'Du må være 16 år eller eldre for å registrere deg']);
        exit();
    }
    //dato til sql
    $formattedDate = $fødselsdato->format('Y-m-d');





    //legge til data i databasen
    $sql = "INSERT INTO del1DB.users (fornavn, etternavn, epost, telefon, fødselsdato) VALUES ('$fornavn', '$etternavn', '$email', '$nummer', '$formattedDate')";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        echo "Error: " . mysqli_error($conn);
        exit();
    }


    // sifra til frontend at alt er bra
    echo json_encode(['message' => 'Registrering vellykket']);
}
