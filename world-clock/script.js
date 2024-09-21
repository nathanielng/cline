// List of major cities with their time zones and country codes
const cities = [
    { name: "Bangkok", timezone: "Asia/Bangkok", country: "TH" },
    { name: "Beijing", timezone: "Asia/Shanghai", country: "CN" },
    { name: "Dubai", timezone: "Asia/Dubai", country: "AE" },
    { name: "Frankfurt", timezone: "Europe/Berlin", country: "DE" },
    { name: "Jakarta", timezone: "Asia/Jakarta", country: "ID" },
    { name: "London", timezone: "Europe/London", country: "GB" },
    { name: "Manila", timezone: "Asia/Manila", country: "PH" },
    { name: "Moscow", timezone: "Europe/Moscow", country: "RU" },
    { name: "New Delhi", timezone: "Asia/Kolkata", country: "IN" },
    { name: "New York", timezone: "America/New_York", country: "US" },
    { name: "Paris", timezone: "Europe/Paris", country: "FR" },
    { name: "Seattle", timezone: "America/Los_Angeles", country: "US" },
    { name: "Singapore", timezone: "Asia/Singapore", country: "SG" },
    { name: "Sydney", timezone: "Australia/Sydney", country: "AU" },
    { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP" }
];

const inputTime = document.getElementById('inputTime');
const inputTimezone = document.getElementById('inputTimezone');
const setTimeBtn = document.getElementById('setTime');
const citySelect = document.getElementById('citySelect');
const addCityBtn = document.getElementById('addCity');
const clocksContainer = document.getElementById('clocksContainer');
const modeToggle = document.getElementById('modeToggle');
const customTimeContainer = document.getElementById('customTimeContainer');

let selectedCities = [];
let isAutoMode = true;
let autoInterval;
let customInterval;

// Populate city select options
cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.timezone;
    const offset = getUTCOffset(city.timezone);
    option.textContent = `${city.name} (UTC${offset})`;
    citySelect.appendChild(option);
});

// Populate input timezone options
cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.timezone;
    const offset = getUTCOffset(city.timezone);
    option.textContent = `${city.name} (${city.timezone}) UTC${offset}`;
    inputTimezone.appendChild(option);
});

// Set current time as default
updateInputTime();

// Set Singapore as the default timezone
inputTimezone.value = "Asia/Singapore";

// Event listener for setting time
setTimeBtn.addEventListener('click', updateClocks);

// Event listener for adding city
addCityBtn.addEventListener('click', addCity);

// Event listener for mode toggle
modeToggle.addEventListener('change', toggleMode);

function addCity() {
    const selectedTimezone = citySelect.value;
    const selectedCity = cities.find(city => city.timezone === selectedTimezone);
    
    if (selectedCity && !selectedCities.includes(selectedTimezone)) {
        selectedCities.push(selectedTimezone);
        createClock(selectedCity);
        updateClocks();
    }
}

function createClock(city) {
    const clock = document.createElement('div');
    clock.className = 'clock';
    clock.innerHTML = `
        <div class="clock-header">
            <img src="https://flagcdn.com/w20/${city.country.toLowerCase()}.png" alt="${city.name} flag" class="country-flag">
            <h2>${city.name}</h2>
        </div>
        <p class="time">⏰ <span class="time-value"></span></p>
        <p class="offset"></p>
        <p class="dst"></p>
        <button class="remove-btn" data-timezone="${city.timezone}">&times;</button>
    `;
    clocksContainer.appendChild(clock);

    // Add event listener to remove button
    clock.querySelector('.remove-btn').addEventListener('click', function() {
        removeClock(this.getAttribute('data-timezone'));
    });
}

function removeClock(timezone) {
    selectedCities = selectedCities.filter(city => city !== timezone);
    updateClocks();
    const clockToRemove = clocksContainer.querySelector(`[data-timezone="${timezone}"]`).closest('.clock');
    clocksContainer.removeChild(clockToRemove);
}

function updateClocks() {
    const inputDateTime = isAutoMode ? new Date() : new Date(inputTime.value);
    const inputTz = inputTimezone.value;

    selectedCities.forEach(cityTz => {
        const clockElement = clocksContainer.querySelector(`[data-timezone="${cityTz}"]`).closest('.clock');
        const timeElement = clockElement.querySelector('.time-value');
        const offsetElement = clockElement.querySelector('.offset');
        const dstElement = clockElement.querySelector('.dst');

        const cityTime = convertTime(inputDateTime, inputTz, cityTz);
        const offset = getUTCOffset(cityTz);
        const isDST = checkDST(cityTz, cityTime);

        timeElement.textContent = formatDate(cityTime);
        offsetElement.textContent = `UTC${offset}`;
        dstElement.textContent = isDST ? "DST Active" : "Standard Time";
        dstElement.className = `dst ${isDST ? 'active' : 'inactive'}`;
    });
}

function convertTime(dateTime, fromTz, toTz) {
    const fromTime = new Date(dateTime.toLocaleString('en-US', { timeZone: fromTz }));
    const toTime = new Date(fromTime.toLocaleString('en-US', { timeZone: toTz }));
    return toTime;
}

function getUTCOffset(timezone) {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate - utcDate) / (60 * 60 * 1000);
    return offset >= 0 ? `+${offset}` : offset;
}

function checkDST(timezone, date) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = jan.toLocaleString('en-US', { timeZone: timezone }).split(' ')[1];
    const julOffset = jul.toLocaleString('en-US', { timeZone: timezone }).split(' ')[1];
    return janOffset !== julOffset;
}

function formatDate(date) {
    const options = { 
        day: 'numeric', 
        month: 'short', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric',
        hour12: true 
    };
    return date.toLocaleString('en-US', options);
}

function updateInputTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    inputTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toggleMode() {
    isAutoMode = modeToggle.checked;
    customTimeContainer.style.display = isAutoMode ? 'none' : 'block';
    clearInterval(autoInterval);
    clearInterval(customInterval);
    if (isAutoMode) {
        autoUpdate();
    } else {
        customUpdate();
    }
}

// Initialize with Singapore, Seattle, London, Tokyo, and Sydney
function initializeCities() {
    const startingCities = ["Asia/Singapore", "America/Los_Angeles", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
    
    startingCities.forEach(timezone => {
        const city = cities.find(city => city.timezone === timezone);
        if (city) {
            selectedCities.push(city.timezone);
            createClock(city);
        }
    });
    
    updateClocks();
}

initializeCities();

// Auto update function
function autoUpdate() {
    updateClocks();
    autoInterval = setInterval(() => {
        updateInputTime();
        updateClocks();
    }, 1000);
}

// Custom time update function
function customUpdate() {
    updateClocks();
    customInterval = setInterval(() => {
        updateClocks();
    }, 1000);
}

// Initial mode setup
toggleMode();

// Event listener for custom time changes
inputTime.addEventListener('change', customUpdate);
inputTimezone.addEventListener('change', customUpdate);
