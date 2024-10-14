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
        'wind': 'windig',
        'fog': 'neblig',
        'snow': 'schneereich',
        'sleet': 'Schneeregen'
    };

    return weatherMap[weatherCondition] || 'unbekannt'; // Return 'unbekannt' if not found
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

        if (data.PASSANTEN_TOTAL) {
            document.getElementById('menschen').textContent = `${data.PASSANTEN_TOTAL} Menschen unterwegs`;

            const averagePeople = 50; // Placeholder value for average number of people
            document.getElementById('durchschnittPersonen').textContent = `${averagePeople}`;

            const percentDifference = ((data.PASSANTEN_TOTAL - averagePeople) / averagePeople * 100).toFixed(2);
            document.getElementById('prozentUnterschied').textContent = `${percentDifference}% mehr`;

            const numPoints = Math.floor(data.PASSANTEN_TOTAL / 10);
            const maxSpeed = 2;
            const area = document.getElementById("trapez");

            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }

            while (area.firstChild) {
                area.removeChild(area.firstChild);
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const point = document.createElement("div");
                point.classList.add("point");
                point.style.left = getRandom(0, area.clientWidth) + "px";
                point.style.top = getRandom(0, area.clientHeight) + "px";

                point.vx = getRandom(-maxSpeed, maxSpeed);
                point.vy = getRandom(-maxSpeed, maxSpeed);

                points.push(point);
                area.appendChild(point);
            }

            function animate() {
                points.forEach(point => {
                    let x = parseFloat(point.style.left);
                    let y = parseFloat(point.style.top);

                    x += point.vx;
                    y += point.vy;

                    if (x <= 0 || x >= area.clientWidth - 8) {
                        point.vx *= -1;
                    }
                    if (y <= 0 || y >= area.clientHeight - 8) {
                        point.vy *= -1;
                    }

                    point.style.left = x + "px";
                    point.style.top = y + "px";
                });

                requestAnimationFrame(animate);
            }

            animate();
        }

        if (data.WETTER) {
            const timePart = data.ZEIT.split(' ')[1];
            const dayOrNight = isDaytime(timePart) ? 'Tag' : 'Nacht';
            let weatherCondition = data.WETTER;

            // Insert translated weather condition into the "wetterAktuell" element
            const wetterAufDeutsch = translateWeatherToGerman(weatherCondition);
            document.getElementById('wetterAktuell').textContent = wetterAufDeutsch;

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
            document.body.style.backgroundImage = `url("${backgroundImagePath}"), url("../bilder/Hintergrund_Textur.jpg")`;
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
