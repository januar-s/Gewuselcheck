<?php
// Die Daten aus dem JSON laden (aus extract.php)
$data = include('extract.php');

// Überprüfen, ob das JSON gültige Daten enthält
if (!$data || !isset($data['measurements'])) {
    die('Keine gültigen Daten gefunden.');
}

// Initialisiert ein Array, um die transformierten Daten zu speichern
$transformedData = [];

// Iteriere über die Messungen im JSON
foreach ($data['measurements'] as $measurement) {
    // Extrahiere die erforderlichen Felder
    $zeit = $measurement['measured_at_local_time'];
    $total_passanten = $measurement['total_count'];
    $wetter = $measurement['weather_conditions']['description'];
    $temperatur = $measurement['weather_conditions']['temperature'];
    
    // Variablen für die Passantenrichtungen initialisieren
    $direction_bahnhof = 0;
    $direction_buerkliplatz = 0;
    
    // Zähle die Passanten in den verschiedenen Richtungen
    foreach ($measurement['counts'] as $count) {
        if ($count['direction'] === 'Richtung - Hauptbahnhof') {
            $direction_bahnhof += $count['count'];
        } elseif ($count['direction'] === 'Richtung - Bürkliplatz') {
            $direction_buerkliplatz += $count['count'];
        }
    }

    // Füge die transformierten Daten zu einem Array hinzu
    $transformedData[] = [
        'ZEIT' => $zeit,
        'DIRECTION_BAHNHOF' => $direction_bahnhof,
        'DIRECTION_BUERKIPLATZ' => $direction_buerkliplatz,
        'PASSANTEN_TOTAL' => $total_passanten,
        'WETTER' => $wetter,
        'TEMPERATUR' => $temperatur
    ];
}

// Die transformierten Daten anzeigen (nur zur Kontrolle)
var_dump($transformedData);
?>