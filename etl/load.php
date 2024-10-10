<?php

// Transformations-Skript 'transform.php' einbinden, um die transformierten Daten zu erhalten
$transformedData = include('transform.php');

require_once 'config.php'; // Bindet die Datenbankkonfiguration ein

try {
    // Erstellt eine neue PDO-Instanz mit den Verbindungsdaten aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL-Query mit Platzhaltern für das Einfügen der Daten
    $insertSql = "INSERT INTO passanten (zeit, direction_bahnhof, direction_buerkliplatz, passanten_total, wetter, temperatur)
                  VALUES (?, ?, ?, ?, ?, ?)";

    // SQL-Query zum Überprüfen, ob ein Eintrag mit derselben ZEIT bereits existiert
    $checkSql = "SELECT COUNT(*) FROM passanten WHERE zeit = ?";

    // Bereitet die SQL-Anweisungen vor
    $insertStmt = $pdo->prepare($insertSql);
    $checkStmt = $pdo->prepare($checkSql);

    // Fügt jedes transformierte Datenelement in die Datenbank ein, wenn es noch nicht existiert
    foreach ($transformedData as $item) {
        // Überprüft, ob die ZEIT bereits existiert
        $checkStmt->execute([$item['ZEIT']]);
        $exists = $checkStmt->fetchColumn();

        // Nur einfügen, wenn kein Datensatz mit derselben ZEIT existiert
        if ($exists == 0) {
            $insertStmt->execute([
                $item['ZEIT'],
                $item['DIRECTION_BAHNHOF'],
                $item['DIRECTION_BUERKLIPLATZ'],
                $item['PASSANTEN_TOTAL'],
                $item['WETTER'],
                $item['TEMPERATUR']
            ]);
        }
    }

    echo "Daten erfolgreich eingefügt oder bereits vorhanden.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}

?>
