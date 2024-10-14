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

        if (data.TEMPERATUR) {
            const temperature = parseFloat(data.TEMPERATUR).toFixed(1);
            document.getElementById('temperatur').textContent = `${temperature}°C`;
        }
        if (data.ZEIT) {
            const [datePart, timePart] = data.ZEIT.split(' ');
            const [year, month, day] = datePart.split('-'); // YYYY-MM-DD
            const formattedDate = `${day}.${month}.${year}`; // Format date as DD.MM.YYYY
            const timeShort = timePart.substring(0, 5); // Extract HH:MM

            document.getElementById('datum').textContent = `${formattedDate}`;
            document.getElementById('uhrzeit').textContent = `${timeShort}`;
            document.getElementById('wochentag').textContent = getWeekday(datePart);
            document.getElementById('zeitFliesstext').textContent = timeShort;
        }

        if (data.WETTER) {
            console.log('Wetter:', data.WETTER);
            const timePart = data.ZEIT.split(' ')[1];
            const dayOrNight = isDaytime(timePart) ? 'Tag' : 'Nacht';
            let weatherCondition = data.WETTER;
        
            // Insert translated weather condition into the "wetterAktuell" element
            const wetterAufDeutsch = translateWeatherToGerman(weatherCondition);
            const wetterAktuellElement = document.getElementById('wetterAktuell');
            wetterAktuellElement.textContent = `${wetterAufDeutsch}`;
        
            // Set the background color of the wetterAktuell element
            const backgroundColor = getWeatherBackgroundColor(weatherCondition);
            wetterAktuellElement.style.backgroundColor = backgroundColor;
        
            if (weatherCondition === 'wind' || weatherCondition === 'fog') {
                weatherCondition = 'wolkig';
            } else if (weatherCondition === 'sleet') {
                weatherCondition = 'Schnee';
            } else {
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
            }
        
            const backgroundImagePath = `../bilder/${dayOrNight}_${weatherCondition}_Bahnhofstrasse_Zürich.png`;
            document.getElementById('inhalt').style.backgroundImage = `url("${backgroundImagePath}")`;
        }
        

        if (data.PASSANTEN_TOTAL) {
            document.getElementById('menschen').textContent = `${data.PASSANTEN_TOTAL} Menschen unterwegs`;

            const averagePeople = 50; // Placeholder value for average number of people
            document.getElementById('durchschnittPersonen').textContent = `${averagePeople}`;

            const percentDifference = ((data.PASSANTEN_TOTAL - averagePeople) / averagePeople * 100).toFixed(2);
            document.getElementById('prozentUnterschied').textContent = `${percentDifference}% mehr`;

            // Setze die minimalen und maximalen Geschwindigkeitsparameter
            const minSpeed = 0.5;  // Minimaler Speed
            const maxSpeed = 2;    // Maximaler Speed
            const numPoints = Math.floor(data.PASSANTEN_TOTAL / 10);
            const area = document.getElementById("trapez");

            // Funktion zur Erzeugung eines zufälligen Wertes innerhalb eines Bereichs
            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }

            // Lösche vorherige Punkte, falls vorhanden
            while (area.firstChild) {
                area.removeChild(area.firstChild);
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const point = document.createElement("div");
                point.classList.add("point");
                point.style.left = getRandom(0, area.clientWidth) + "px";
                point.style.top = getRandom(0, area.clientHeight) + "px";

                // Setze zufällige Geschwindigkeiten innerhalb des minimalen und maximalen Bereichs
                point.vx = getRandom(minSpeed, maxSpeed);
                point.vy = getRandom(minSpeed, maxSpeed);

                // Zufällige negative Geschwindigkeiten für Richtung
                if (Math.random() > 0.5) point.vx *= -1;
                if (Math.random() > 0.5) point.vy *= -1;

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

                // Starte die Animation
                requestAnimationFrame(animate);
            }

            // Starte die Animation
            animate();

        }
    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Daten:', error);
    });



// Chart.js Bibliothek einbinden (CDN-Link)
const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartScript);

chartScript.onload = () => {
    // Funktion, um die Grafik mit neuen Daten zu aktualisieren
    function updateChart(chart, data) {
        chart.data.datasets[0].data = data; // Update data
        chart.update();
    }

    // Diagramm initialisieren, wenn das Script geladen ist
    const ctx = document.getElementById('passantenChart').getContext('2d');
    const passantenChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            datasets: [{
                label: 'Passanten',
                data: [], // Die Daten werden später hinzugefügt
                borderColor: '#4e5d8a',
                backgroundColor: 'rgba(78, 93, 138, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4 // Glättung des Graphen
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2800 // Setze das Maximum der Y-Achse auf 2800, wie im Bild
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Daten von der API holen und das Diagramm aktualisieren
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const passantenData = data.PASSANTEN_TIMESERIES || []; // Ersetze mit deinem tatsächlichen Daten-Array
            updateChart(passantenChart, passantenData);
        })
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
};
