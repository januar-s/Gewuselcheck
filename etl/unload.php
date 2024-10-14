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

        // Fetch the result as an associative array
        $data = $stmt->fetch();

        // Check if data was fetched successfully
        if ($data) {
            // Return the data as a JSON response
            header('Content-Type: application/json');
            echo json_encode($data);
        } else {
            // If no data is found, return an empty JSON object
            echo json_encode([]);
        }
    } catch (PDOException $e) {
        // If an error occurs, return the error as a JSON response
        echo json_encode(['error' => $e->getMessage()]);
    }
?>