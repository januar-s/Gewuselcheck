// URL to your PHP script (replace with your actual domain)
const url = 'https://im3.kreativschmidt.ch/etl/unload.php';

// Function to determine if it's day or night based on the time (optional customization)
function isDaytime(timePart) {
    const hour = parseInt(timePart.split(':')[0], 10); // Extract the hour from HH:MM:SS
    return hour >= 6 && hour < 18; // Assume daytime is between 6 AM and 6 PM
}

// Fetch the data from PHP
fetch(url)
    .then(response => {
        // Check if the response is OK (status code 200)
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        // Parse the response JSON
        return response.json();
    })
    .then(data => {
        // Log the data to the console (for testing)
        console.log('Fetched Data:', data);
        
        // Example: Use the data to update HTML elements
        // Assuming you have HTML elements to display the fetched data:
        // <div id="time"></div>
        // <div id="passantenTotal"></div>
        // <div id="wetter"></div>

        if (data.ZEIT) {
            // Split the ZEIT string into date and time parts
            const [datePart, timePart] = data.ZEIT.split(' ');

                // Split the datePart (YYYY-MM-DD) into year, month, and day
                const [year, month, day] = datePart.split('-');

                // Format the date as DD.MM.YYYY
                const formattedDate = `${day}.${month}.${year}`;
        
            // Insert the date into the element with id "datum"
            document.getElementById('datum').textContent = `${formattedDate}`;
        
            // Insert the time (HH:MM only) into the element with id "uhrzeit"
            const timeShort = timePart.substring(0, 5); // Extract HH:MM
            document.getElementById('uhrzeit').textContent = `${timeShort}`;

        }        
        if (data.PASSANTEN_TOTAL) {
            document.getElementById('menschen').textContent = `${data.PASSANTEN_TOTAL} Menschen unterwegs`;
        
            // Berechne die Anzahl der Punkte basierend auf PASSANTEN_TOTAL
            const numPoints = Math.floor(data.PASSANTEN_TOTAL / 10);
        
            // Anzahl der Punkte und Geschwindigkeitsparameter
            const maxSpeed = 2;
            const area = document.getElementById("trapez");
        
            // Funktion zur Erzeugung eines zufälligen Wertes innerhalb eines Bereichs
            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }
        
            // Entferne vorherige Punkte, falls vorhanden
            while (area.firstChild) {
                area.removeChild(area.firstChild);
            }
        
            // Initialisiere die Punkte und füge sie dem Trapez hinzu
            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const point = document.createElement("div");
                point.classList.add("point");
                point.style.left = getRandom(0, area.clientWidth) + "px";
                point.style.top = getRandom(0, area.clientHeight) + "px";
                
                // Bewegungsgeschwindigkeit in X- und Y-Richtung
                point.vx = getRandom(-maxSpeed, maxSpeed);
                point.vy = getRandom(-maxSpeed, maxSpeed);
        
                points.push(point);
                area.appendChild(point);
            }
        
            // Animationsfunktion
            function animate() {
                points.forEach(point => {
                    let x = parseFloat(point.style.left);
                    let y = parseFloat(point.style.top);
        
                    // Aktualisiere die Position des Punktes
                    x += point.vx;
                    y += point.vy;
        
                    // Pralle von den Wänden des Trapezes ab
                    if (x <= 0 || x >= area.clientWidth - 8) {
                        point.vx *= -1;
                    }
                    if (y <= 0 || y >= area.clientHeight - 8) {
                        point.vy *= -1;
                    }
        
                    // Setze die neue Position
                    point.style.left = x + "px";
                    point.style.top = y + "px";
                });
        
                // Setze die Animation in Bewegung
                requestAnimationFrame(animate);
            }
        
            // Starte die Animation
            animate();
        }
        if (data.WETTER) {
            // Split the ZEIT to get time information for day or night check
            const timePart = data.ZEIT.split(' ')[1]; 
            const dayOrNight = isDaytime(timePart) ? 'Tag' : 'Nacht'; // 'Tag' for day, 'Nacht' for night
        
            let weatherCondition = data.WETTER;
        
            // Map specific conditions to similar image categories
            if (weatherCondition === 'wind' || weatherCondition === 'fog') {
                weatherCondition = isDaytime(timePart) ? 'wolkig' : 'wolkig'; // Use cloudy images
            } else if (weatherCondition === 'sleet') {
                weatherCondition = 'Schnee'; // Treat sleet as snow
            } else {
                // Map other weather conditions to specific translations for filenames
                const weatherMap = {
                    'clear-day': 'sonnig',
                    'clear-night': 'wolkenlos',
                    'partly-cloudy-day': 'wolkig',
                    'partly-cloudy-night': 'wolkig',
                    'cloudy': 'wolkig',
                    'rain': 'regen',
                    'snow': 'Schnee'
                };
        
                weatherCondition = weatherMap[weatherCondition] || 'wolkig'; // Default to 'wolkig' if no match
            }
        
            // Create the background image path based on day or night and the weather condition
            const backgroundImagePath = `../bilder/${dayOrNight}_${weatherCondition}_Bahnhofstrasse_Zürich.png`;
        
            // Apply the background image using JavaScript
            document.body.style.backgroundImage = `url("${backgroundImagePath}"), url("../bilder/Hintergrund_Textur.jpg")`;
        
            // Log the applied background for debugging purposes
            console.log(`Applied background image: ${backgroundImagePath}`);
        }
    })
    .catch(error => {
        // Handle any errors that occur during the fetch
        console.error('There was a problem with the fetch operation:', error);
    });    