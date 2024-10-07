<?php
require_once 'config.php';

try {
    // Create a new PDO instance using the values from config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // Define the SQL query
    $sql = "SELECT * FROM notes";

    // Prepare the statement
    $stmt = $pdo->prepare($sql);

    // Execute the query
    $stmt->execute();

    // Fetch all results
    $result = $stmt->fetchAll();

    // Check if any results were returned
    if ($result) {
        // Loop through the results and print each row
        foreach ($result as $row) {
            echo "ID: " . $row['ID'] . "   Titel:" . $row['Titel'] ." - Note: " . $row['Notiz'] . "<br>";
        }
    } else {
        echo "Keine Ergebnisse gefunden";
    }

} catch (PDOException $e) {
    // If an error occurs, display the error message
    die("Fehler bei der Verbindung zur Datenbank: " . $e->getMessage());
}

// ich möchte eine Notiz hinzufügen
try {
    // Define the SQL query to insert a new note
    $sql = "INSERT INTO notes (Notiz) VALUES ('Neue Notiz')";

    // Prepare the statement
    $stmt = $pdo->prepare($sql);

    // Execute the query
    $stmt->execute();

    echo "Notiz erfolgreich hinzugefügt";

} catch (PDOException $e) {
    // If an error occurs, display the error message
    die("Fehler beim Hinzufügen der Notiz: " . $e->getMessage());
}


?>