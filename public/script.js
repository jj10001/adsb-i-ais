let map;
let userMarker;
let aircraftMarkers = {};
let userLat, userLon;

// Initialize map
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Get user location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLon = position.coords.longitude;

                map.setView([userLat, userLon], 9);

                userMarker = L.marker([userLat, userLon], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: '📍',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(map).bindPopup("Your Location");

                fetchData();
                setInterval(fetchData, 5000); // Update every 5 seconds
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Defaulting to London.");
                userLat = 51.5074;
                userLon = -0.1278;
                map.setView([userLat, userLon], 9);
                fetchData();
                setInterval(fetchData, 5000);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

// Fetch aircraft data
async function fetchData() {
    if (!userLat || !userLon) return;

    const radius = document.getElementById('radius').value || 100;

    try {
        const response = await fetch(`/api/flights?lat=${userLat}&lon=${userLon}&radius=${radius}`);
        const data = await response.json();

        updateUI(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Create airplane icon with rotation
function createAirplaneIcon(trackDeg) {
    return L.divIcon({
        className: 'airplane-icon',
        // Use a simple plane emoji and rotate it
        html: `<div style="transform: rotate(${trackDeg - 45}deg);">✈️</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}

// Update Map and Sidebar
function updateUI(data) {
    document.getElementById('total-aircraft').innerText = data.total;

    const timeString = new Date(data.timestamp * 1000).toLocaleTimeString();
    document.getElementById('last-update').innerText = timeString;

    const listElement = document.getElementById('aircraft-list');
    listElement.innerHTML = '';

    // Keep track of current hex codes to remove old markers
    const currentHexes = new Set(data.aircraft.map(ac => ac.hex));

    // Remove markers for aircraft no longer in range
    for (const hex in aircraftMarkers) {
        if (!currentHexes.has(hex)) {
            map.removeLayer(aircraftMarkers[hex]);
            delete aircraftMarkers[hex];
        }
    }

    data.aircraft.sort((a, b) => a.distance_km - b.distance_km).forEach(ac => {
        // Update or add marker
        if (aircraftMarkers[ac.hex]) {
            aircraftMarkers[ac.hex].setLatLng([ac.lat, ac.lon]);
            aircraftMarkers[ac.hex].setIcon(createAirplaneIcon(ac.track_deg));
            aircraftMarkers[ac.hex].setPopupContent(`
                <b>Flight:</b> ${ac.flight}<br>
                <b>Type:</b> ${ac.type}<br>
                <b>Altitude:</b> ${ac.altitude_ft} ft<br>
                <b>Speed:</b> ${ac.speed_kts} kts<br>
                <b>Distance:</b> ${ac.distance_km} km
            `);
        } else {
            const marker = L.marker([ac.lat, ac.lon], {
                icon: createAirplaneIcon(ac.track_deg)
            }).bindPopup(`
                <b>Flight:</b> ${ac.flight}<br>
                <b>Type:</b> ${ac.type}<br>
                <b>Altitude:</b> ${ac.altitude_ft} ft<br>
                <b>Speed:</b> ${ac.speed_kts} kts<br>
                <b>Distance:</b> ${ac.distance_km} km
            `).addTo(map);
            aircraftMarkers[ac.hex] = marker;
        }

        // Add to sidebar
        const li = document.createElement('li');
        li.className = 'aircraft-item';
        li.innerHTML = `
            <h4>${ac.flight} (${ac.hex})</h4>
            <p>Type: ${ac.type} | Alt: ${ac.altitude_ft} ft</p>
            <p>Speed: ${ac.speed_kts} kts | Hdg: ${ac.track_deg}°</p>
            <p>Distance: ${ac.distance_km} km</p>
        `;
        li.onclick = () => {
            map.setView([ac.lat, ac.lon], 11);
            aircraftMarkers[ac.hex].openPopup();
        };
        listElement.appendChild(li);
    });
}

document.getElementById('update-btn').addEventListener('click', fetchData);

// Start
document.addEventListener('DOMContentLoaded', initMap);
