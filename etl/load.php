<?php

// Transformations-Skript 'transform.php' einbinden, um die transformierten Daten zu erhalten
$transformedData = include('transform.php');

require_once 'config.php'; // Bindet die Datenbankkonfiguration ein

try {
    // Erstellt eine neue PDO-Instanz mit den Verbindungsdaten aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL-Query mit Platzhaltern für das Einfügen der Daten
    $sql = "INSERT INTO passanten (zeit, direction_bahnhof, direction_buerkliplatz, passanten_total, wetter, temperatur)
            VALUES (?, ?, ?, ?, ?, ?)";

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Fügt jedes transformierte Datenelement in die Datenbank ein
    foreach ($transformedData as $item) {
        $stmt->execute([
            $item['ZEIT'],
            $item['DIRECTION_BAHNHOF'],
            $item['DIRECTION_BUERKLIPLATZ'],
            $item['PASSANTEN_TOTAL'],
            $item['WETTER'],
            $item['TEMPERATUR']
        ]);
    }

    echo "Daten erfolgreich eingefügt.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}

?>