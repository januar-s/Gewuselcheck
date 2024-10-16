// URL to your PHP script (replace with your actual domain)
const url = 'https://im3.kreativschmidt.ch/etl/unload.php';

// Function to determine if it's day or night based on the time (optional customization)
function isDaytime(timePart) {
    const hour = parseInt(timePart.split(':')[0], 10); // Extract the hour from HH:MM:SS
    return hour >= 6 && hour < 18; // Assume daytime is between 6 AM and 6 PM
}

// Function to get the weekday name
function getWeekday(dateString) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const date = new Date(dateString);
    return days[date.getUTCDay()]; // Get the day of the week (0=Sunday, 6=Saturday)
}

// Function to translate weather condition into German
function translateWeatherToGerman(weatherCondition) {
    const weatherMap = {
        'clear-day': 'sonnig',
        'clear-night': 'klar',
        'partly-cloudy-day': 'leicht bewölkt',
        'partly-cloudy-night': 'leicht bewölkt',
        'cloudy': 'bewölkt',
        'rain': 'regnerisch',
        'wind': 'wolkig',
        'fog': 'wolkig',
        'snow': 'schneereich',
        'sleet': 'schneereich'
    };

    return weatherMap[weatherCondition] || 'unbekannt'; // Return 'unbekannt' if not found
}

// Funktion zur Bestimmung der Hintergrundfarbe basierend auf dem Wetter
function getWeatherBackgroundColor(weatherCondition) {
    const weatherColorMap = {
        'clear-day': '#FFD700',     // Sonnig - Gelb
        'clear-night': '#125ba2',   // Klar - Blau
        'partly-cloudy-day': '#87CEEB',  // Leicht bewölkt - Hellblau
        'partly-cloudy-night': '#708090', // Leicht bewölkt Nacht - Grau
        'cloudy': '#87CEEB',        // Bewölkt - Lichtblau
        'rain': '#4682B4',          // Regen - Blau
        'wind': '#4682B4',          // Windig - Türkis
        'fog': '#4682B4',           // Neblig - Grau
        'snow': '#b8bfc2',          // Schneereich - Weiß
        'sleet': '#b8bfc2',         // Schneeregen - Hellblau
        'unbekannt': '#8f9acc'      // Default
    };

    return weatherColorMap[weatherCondition] || weatherColorMap['unbekannt']; // Fallback-Farbe
}

// Fetch the data from PHP
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched Data:', data);

        const latestEntry = data.latestEntry;

        // Populate temperature from the latest entry
        if (latestEntry.TEMPERATUR) {
            const temperature = parseFloat(latestEntry.TEMPERATUR).toFixed(1);
            document.getElementById('temperatur').textContent = `${temperature}°C`;
        }

        // Populate date and time from the latest entry
        if (latestEntry.ZEIT) {
            const [datePart, timePart] = latestEntry.ZEIT.split(' ');
            const [year, month, day] = datePart.split('-'); // YYYY-MM-DD
            const formattedDate = `${day}.${month}.${year}`; // Format date as DD.MM.YYYY
            const timeShort = timePart.substring(0, 5); // Extract HH:MM

            document.getElementById('datum').textContent = `${formattedDate}`;
            document.getElementById('uhrzeit').textContent = `${timeShort}`;
            document.getElementById('wochentag').textContent = getWeekday(datePart);
            document.getElementById('zeitFliesstext').textContent = timeShort;
        }

        // Handle weather condition
        if (latestEntry.WETTER) {
            console.log('Wetter:', latestEntry.WETTER);
            const timePart = latestEntry.ZEIT.split(' ')[1];
            const dayOrNight = isDaytime(timePart) ? 'Tag' : 'Nacht';
            let weatherCondition = latestEntry.WETTER;

            // Insert translated weather condition into the "wetterAktuell" element
            const wetterAufDeutsch = translateWeatherToGerman(weatherCondition);
            const wetterAktuellElement = document.getElementById('wetterAktuell');
            wetterAktuellElement.textContent = `${wetterAufDeutsch}`;

            // Set the background color of the wetterAktuell element
            const backgroundColor = getWeatherBackgroundColor(weatherCondition);
            wetterAktuellElement.style.backgroundColor = backgroundColor;

            // Adjust the background image based on weather
            const weatherMap = {
                'clear-day': 'sonnig',
                'clear-night': 'wolkenlos',
                'partly-cloudy-day': 'wolkig',
                'partly-cloudy-night': 'wolkig',
                'cloudy': 'wolkig',
                'rain': 'regen',
                'snow': 'Schnee'
            };
            weatherCondition = weatherMap[weatherCondition] || 'wolkig';

            const backgroundImagePath = `../bilder/${dayOrNight}_${weatherCondition}_Bahnhofstrasse_Zürich.png`;
            document.getElementById('inhalt').style.backgroundImage = `url("${backgroundImagePath}")`;
        }

        // Handle PASSANTEN_TOTAL for the latest entry and matching entries
        if (latestEntry.PASSANTEN_TOTAL) {
            document.getElementById('menschen').textContent = `${latestEntry.PASSANTEN_TOTAL} Menschen unterwegs`;

            // Calculate the average from the "passanten" array
            const passanten = data.passanten;
            if (passanten.length > 0) {
                const total = passanten.reduce((acc, val) => acc + val, 0);
                const averagePeople = Math.round(total / passanten.length); // Round to nearest integer

                document.getElementById('durchschnittPersonen').textContent = `${averagePeople}`;

                // Calculate the percentage difference and round it to the nearest integer
                const percentDifference = Math.round((latestEntry.PASSANTEN_TOTAL - averagePeople) / averagePeople * 100);

                // Display "mehr" if more than the average, otherwise display "weniger"
                const differenceText = percentDifference > 0 ? 'mehr' : 'weniger';
                document.getElementById('prozentUnterschied').textContent = `${Math.abs(percentDifference)}% ${differenceText}`;
            }

            // Set up animation with points based on PASSANTEN_TOTAL
            const minSpeed = 0.5;  // Minimaler Speed
            const maxSpeed = 2;    // Maximaler Speed
            const numPoints = Math.floor(latestEntry.PASSANTEN_TOTAL / 10);
            const area = document.getElementById("trapez");

            // Function to generate random value within a range
            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }

            // Remove previous points, if any
            while (area.firstChild) {
                area.removeChild(area.firstChild);
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const point = document.createElement("div");
                point.classList.add("point");
                point.style.left = getRandom(0, area.clientWidth) + "px";
                point.style.top = getRandom(0, area.clientHeight) + "px";

                // Set random speeds within the minimum and maximum range
                point.vx = getRandom(minSpeed, maxSpeed);
                point.vy = getRandom(minSpeed, maxSpeed);

                // Randomly reverse the direction
                if (Math.random() > 0.5) point.vx *= -1;
                if (Math.random() > 0.5) point.vy *= -1;

                points.push(point);
                area.appendChild(point);
            }

            // Animation function
            function animate() {
                points.forEach(point => {
                    let x = parseFloat(point.style.left);
                    let y = parseFloat(point.style.top);

                    // Update the point's position
                    x += point.vx;
                    y += point.vy;

                    // Bounce off the trapezoid walls
                    if (x <= 0 || x >= area.clientWidth - 8) {
                        point.vx *= -1;
                    }
                    if (y <= 0 || y >= area.clientHeight - 8) {
                        point.vy *= -1;
                    }

                    // Set the new position
                    point.style.left = x + "px";
                    point.style.top = y + "px";
                });

                // Start the animation
                requestAnimationFrame(animate);
            }

            // Start the animation
            animate();
        };
    });