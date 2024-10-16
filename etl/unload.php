<?php
// Include database configuration file
require 'config.php';

try {
    // Create a new PDO instance
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL query to get the latest entry based on time (ZEIT)
    $sql = "SELECT ZEIT, PASSANTEN_TOTAL, WETTER, TEMPERATUR FROM passanten ORDER BY ZEIT DESC LIMIT 1";

    // Prepare the statement
    $stmt = $pdo->prepare($sql);

    // Execute the statement
    $stmt->execute();

    // Fetch the most recent entry as an associative array
    $latestEntry = $stmt->fetch();

    // Check if the latest entry was fetched successfully
    if ($latestEntry) {
        // Get the time from the most recent entry
        $latestTime = $latestEntry['ZEIT'];

        // Calculate the weekday of the most recent entry
        $weekday = date('w', strtotime($latestTime)); // 'w' gives the numeric representation of the day (0 = Sunday, 6 = Saturday)
        
        // Get the time (hour and minute) from the most recent entry
        $timeOfDay = date('H:i:s', strtotime($latestTime)); // Extracting time part in 'HH:MM:SS' format

        // SQL query to get only the PASSANTEN_TOTAL from entries with the same weekday and time
        $sql = "
            SELECT PASSANTEN_TOTAL 
            FROM passanten 
            WHERE DAYOFWEEK(ZEIT) = :weekday AND TIME(ZEIT) = :timeOfDay
            ORDER BY ZEIT DESC";

        // Prepare the statement
        $stmt = $pdo->prepare($sql);

        // Bind parameters for weekday and time
        $stmt->bindParam(':weekday', $weekday, PDO::PARAM_INT);
        $stmt->bindParam(':timeOfDay', $timeOfDay, PDO::PARAM_STR);

        // Execute the statement
        $stmt->execute();

        // Fetch all matching PASSANTEN_TOTAL values
        $passantenEntries = $stmt->fetchAll(PDO::FETCH_COLUMN); // Fetches only PASSANTEN_TOTAL values in a simple array

        // Prepare the response as a JSON object with separate arrays
        $response = [
            'latestEntry' => $latestEntry,        // Full details of the most recent entry
            'passanten' => $passantenEntries      // Only PASSANTEN_TOTAL values for entries with same weekday and hour
        ];

        // Return the response as a JSON
        header('Content-Type: application/json');
        echo json_encode($response);

    } else {
        // If no data is found, return an empty JSON object
        echo json_encode([]);
    }
} catch (PDOException $e) {
    // If an error occurs, return the error as a JSON response
    echo json_encode(['error' => $e->getMessage()]);
}
?>
