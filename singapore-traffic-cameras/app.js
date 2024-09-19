const API_ENDPOINT = 'https://api.data.gov.sg/v1/transport/traffic-images';
const cameraDropdown = document.getElementById('camera-dropdown');
const cameraDisplay = document.getElementById('camera-display');

let cameras = [];

async function fetchCameras() {
    try {
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();
        cameras = data.items[0].cameras;
        cameras.forEach(camera => {
            camera.description = generateLocationDescription(camera.location);
        });
        populateCameraDropdown();
    } catch (error) {
        console.error('Error fetching camera data:', error);
    }
}

function generateLocationDescription(location) {
    const { latitude, longitude } = location;
    
    const areas = [
        { name: "Changi", lat: 1.3644, lon: 103.9915, radius: 0.05 },
        { name: "Marina Bay", lat: 1.2847, lon: 103.8610, radius: 0.02 },
        { name: "Orchard Road", lat: 1.3050, lon: 103.8308, radius: 0.015 },
        { name: "Sentosa", lat: 1.2494, lon: 103.8303, radius: 0.03 },
        { name: "Jurong", lat: 1.3329, lon: 103.7436, radius: 0.06 },
        { name: "Woodlands", lat: 1.4382, lon: 103.7890, radius: 0.05 },
        { name: "Punggol", lat: 1.4041, lon: 103.9025, radius: 0.04 },
        { name: "Tampines", lat: 1.3496, lon: 103.9568, radius: 0.04 },
        { name: "Bedok", lat: 1.3236, lon: 103.9273, radius: 0.04 },
        { name: "Ang Mo Kio", lat: 1.3691, lon: 103.8454, radius: 0.04 },
        { name: "Toa Payoh", lat: 1.3343, lon: 103.8563, radius: 0.03 },
        { name: "Clementi", lat: 1.3162, lon: 103.7649, radius: 0.03 },
        { name: "Bukit Timah", lat: 1.3294, lon: 103.8021, radius: 0.04 },
        { name: "Kallang", lat: 1.3100, lon: 103.8714, radius: 0.03 },
        { name: "Novena", lat: 1.3204, lon: 103.8438, radius: 0.02 },
        { name: "Yishun", lat: 1.4304, lon: 103.8354, radius: 0.05 },
        { name: "Bukit Batok", lat: 1.3590, lon: 103.7637, radius: 0.03 },
        { name: "Serangoon", lat: 1.3554, lon: 103.8679, radius: 0.03 },
        { name: "Seletar", lat: 1.4131, lon: 103.8657, radius: 0.04 },
        { name: "Bukit Panjang", lat: 1.3774, lon: 103.7719, radius: 0.03 },
        { name: "Outram", lat: 1.2804, lon: 103.8386, radius: 0.02 },
        { name: "Bukit Merah", lat: 1.2819, lon: 103.8239, radius: 0.03 },
        { name: "Lower Delta", lat: 1.2730, lon: 103.8233, radius: 0.015 },
        { name: "Pioneer", lat: 1.3175, lon: 103.6973, radius: 0.03 },
        { name: "Tuas Checkpoint", lat: 1.3472, lon: 103.6368, radius: 0.03 },
        { name: "Paya Lebar", lat: 1.3178, lon: 103.8918, radius: 0.03 },
        { name: "Changi Airport", lat: 1.3644, lon: 103.9915, radius: 0.05 },
        { name: "Sembawang", lat: 1.4491, lon: 103.8185, radius: 0.04 },
        { name: "Pasir Ris", lat: 1.3721, lon: 103.9474, radius: 0.04 },
        { name: "Sengkang", lat: 1.3868, lon: 103.8914, radius: 0.04 },
        { name: "Choa Chu Kang", lat: 1.3840, lon: 103.7470, radius: 0.04 },
        { name: "Mandai", lat: 1.4043, lon: 103.7891, radius: 0.04 },
        { name: "Geylang", lat: 1.3201, lon: 103.8920, radius: 0.03 },
        { name: "Jalan Bahar", lat: 1.3473, lon: 103.6901, radius: 0.03 },
        { name: "Lim Chu Kang", lat: 1.4311, lon: 103.7062, radius: 0.04 },
        { name: "Kranji", lat: 1.4387, lon: 103.7363, radius: 0.03 },
        { name: "Tuas South", lat: 1.2943, lon: 103.6426, radius: 0.04 },
        { name: "Jurong Island", lat: 1.2660, lon: 103.6695, radius: 0.05 },
        { name: "Holland Village", lat: 1.3110, lon: 103.7960, radius: 0.02 },
        { name: "Bukit Brown", lat: 1.3351, lon: 103.8213, radius: 0.02 },
        { name: "Tuas Flyover", lat: 1.3229, lon: 103.6635, radius: 0.02 },
        { name: "Portsdown", lat: 1.2741, lon: 103.7927, radius: 0.02 },
        { name: "Tanah Merah Coast Road", lat: 1.3245, lon: 103.9770, radius: 0.03 }
    ];

    const closest = areas.reduce((prev, curr) => {
        const distance = Math.sqrt(
            Math.pow(latitude - curr.lat, 2) + Math.pow(longitude - curr.lon, 2)
        );
        return distance < prev.distance ? { ...curr, distance } : prev;
    }, { distance: Infinity });

    if (closest.distance <= closest.radius) {
        return `Near ${closest.name}`;
    } else {
        const direction = getDirection(1.3521, 103.8198, latitude, longitude);
        return `${direction} Singapore`;
    }
}

function getDirection(centerLat, centerLon, lat, lon) {
    const angle = Math.atan2(lon - centerLon, lat - centerLat) * 180 / Math.PI;
    const directions = ['Northern', 'North-Eastern', 'Eastern', 'South-Eastern', 'Southern', 'South-Western', 'Western', 'North-Western'];
    return directions[Math.round(((angle + 180) % 360) / 45)];
}

function populateCameraDropdown() {
    cameraDropdown.innerHTML = '';
    
    // Sort cameras alphabetically by description
    cameras.sort((a, b) => a.description.localeCompare(b.description));

    cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.camera_id;
        option.textContent = `${camera.description} (Camera ${camera.camera_id})`;
        cameraDropdown.appendChild(option);
    });
    console.log(`Populated dropdown with ${cameras.length} options`);
}

function displaySelectedCameras() {
    const selectedOptions = Array.from(cameraDropdown.selectedOptions);
    const selectedCameras = selectedOptions.map(option => 
        cameras.find(camera => camera.camera_id === option.value)
    );

    cameraDisplay.innerHTML = '';

    selectedCameras.forEach(camera => {
        const cameraFeed = document.createElement('div');
        cameraFeed.className = 'camera-feed';
        cameraFeed.innerHTML = `
            <h3>${camera.description}</h3>
            <img src="${camera.image}" alt="Traffic Camera ${camera.camera_id}">
            <div class="camera-metadata">
                <p>Camera ID: ${camera.camera_id}</p>
                <p>Latitude: ${camera.location.latitude.toFixed(4)}</p>
                <p>Longitude: ${camera.location.longitude.toFixed(4)}</p>
                <p>Timestamp: ${formatTimestamp(camera.timestamp)}</p>
            </div>
        `;
        cameraDisplay.appendChild(cameraFeed);
    });
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-SG', { 
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

cameraDropdown.addEventListener('change', displaySelectedCameras);

fetchCameras().then(() => {
    console.log('Initialization complete');
}).catch(error => {
    console.error('Error during initialization:', error);
});
