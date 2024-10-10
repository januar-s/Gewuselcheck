<?php
include 'config.php';

function fetchData($apikey) {
    // Erzeuge die aktuelle Zeit (Endzeit) im RFC 3339-Format
    $currentTime = new DateTime(); // Aktuelle Zeit
    $currentTime->setTimezone(new DateTimeZone('Europe/Zurich')); // Setze Zeitzone
    $to = $currentTime->modify('-1 hour')->format(DateTime::RFC3339); // Format als RFC 3339 (aktuelle Zeit)
    
    // Erzeuge den Startzeitpunkt (1 Stunde vor der aktuellen Zeit)
    $from = $currentTime->modify('-1 hour')->format(DateTime::RFC3339); // Eine Stunde früher
    
    // Baue die URL mit den dynamischen Zeitparametern
    $url = "https://api.hystreet.com/v2/locations/331/measurements?from=" . urlencode($from) . "&to=" . urlencode($to) . "&resolution=hour&include_weather_data=true";

    $curl = curl_init();

    curl_setopt_array($curl, [
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "GET",
      CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "X-API-TOKEN: $apikey"
      ],
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
      echo "cURL Error #:" . $err;
    } else {
      // echo $response;
    }

    // Dekodiert die JSON-Antwort und gibt Daten zurück
    return json_decode($response, true);
}

// Gibt die Daten zurück, wenn dieses Skript eingebunden ist
return fetchData($apikey);
?>