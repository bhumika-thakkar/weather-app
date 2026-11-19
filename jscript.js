const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("weather-description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

// Convert weather codes into readable descriptions.
function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";

    if ([45, 48].includes(code)) {
        return "Foggy";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "Drizzle";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rainy";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snowy";
    }

    if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    }

    return "Weather information unavailable";
}

// Choose an icon based on the weather.
function getWeatherIcon(code, isDay) {
    if (code === 0) {
        return isDay ? "☀️" : "🌙";
    }

    if ([1, 2].includes(code)) {
        return isDay ? "🌤️" : "☁️";
    }

    if (code === 3) return "☁️";

    if ([45, 48].includes(code)) return "🌫️";

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "🌦️";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "🌧️";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "❄️";
    }

    if ([95, 96, 99].includes(code)) {
        return "⛈️";
    }

    return "🌍";
}

// Search for a city and display its current weather.
async function getWeather(city) {
    message.textContent = "Loading weather...";
    cityName.textContent = "Searching...";
    searchForm.querySelector("button").disabled = true;

    try {
        // Step 1: Find the city's coordinates.
        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get the current weather.
        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Display the results.
        cityName.textContent =
            location.name +
            (location.admin1 ? ", " + location.admin1 : "") +
            (location.country ? ", " + location.country : "");

        temperature.textContent =
            Math.round(current.temperature_2m) + "°C";

        description.textContent =
            getWeatherDescription(current.weather_code);

        weatherIcon.textContent =
            getWeatherIcon(current.weather_code, current.is_day);

        humidity.textContent =
            current.relative_humidity_2m + "%";

        windSpeed.textContent =
            current.wind_speed_10m + " km/h";

        message.textContent = "";

    } catch (error) {
        cityName.textContent = "Weather unavailable";
        weatherIcon.textContent = "🌍";
        temperature.textContent = "--°C";
        description.textContent = "Please try again.";
        humidity.textContent = "--%";
        windSpeed.textContent = "-- km/h";
        message.textContent = error.message;
    } finally {
        searchForm.querySelector("button").disabled = false;
    }
}

// Run the search when the form is submitted.
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});