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

    // SQL-Query zum Aktualisieren eines bestehenden Datensatzes
    $updateSql = "UPDATE passanten 
                  SET direction_bahnhof = ?, direction_buerkliplatz = ?, passanten_total = ?, wetter = ?, temperatur = ? 
                  WHERE zeit = ?";

    // Bereitet die SQL-Anweisungen vor
    $insertStmt = $pdo->prepare($insertSql);
    $checkStmt = $pdo->prepare($checkSql);
    $updateStmt = $pdo->prepare($updateSql);

    var_dump($transformedData);

    // Fügt jedes transformierte Datenelement in die Datenbank ein, wenn es noch nicht existiert, oder aktualisiert es
    foreach ($transformedData as $item) {
        // Überprüft, ob die ZEIT bereits existiert
        $checkStmt->execute([$item['ZEIT']]);
        $exists = $checkStmt->fetchColumn();

        if ($exists == 0) {
            // Daten einfügen, wenn sie noch nicht existieren
            $insertStmt->execute([
                $item['ZEIT'],
                $item['DIRECTION_BAHNHOF'],
                $item['DIRECTION_BUERKLIPLATZ'],
                $item['PASSANTEN_TOTAL'],
                $item['WETTER'],
                $item['TEMPERATUR']
            ]);
        } else {
            // Daten aktualisieren, wenn sie bereits existieren
            $updateStmt->execute([
                $item['DIRECTION_BAHNHOF'],
                $item['DIRECTION_BUERKLIPLATZ'],
                $item['PASSANTEN_TOTAL'],
                $item['WETTER'],
                $item['TEMPERATUR'],
                $item['ZEIT']
            ]);
        }
    }

    echo "Daten erfolgreich eingefügt oder aktualisiert.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}