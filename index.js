const api = {
    endpoint: "https://api.openweathermap.org/data/2.5/",
    key: "ec0e544b9c69112a0b87d3499a5c0e16"
};

const input = document.querySelector(".input");

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        const city = input.value.trim();
        if (city) {
            getWeather(city);
            input.value = "";
        }
    }
});

async function getWeather(city) {
    try {
        showLoading(true);

        const response = await fetch(
            `${api.endpoint}weather?q=${city}&units=metric&appid=${api.key}`
        );

        const data = await response.json();

        if (data.cod && data.cod !== 200) {
            throw new Error(data.message || "Город не найден");
        }

        displayWeather(data);
        showLoading(false);

    } catch (error) {
        showError(`Ошибка: ${error.message}`);
        showLoading(false);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        showLoading(true);

        const response = await fetch(
            `${api.endpoint}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`
        );

        const data = await response.json();
        displayWeather(data);
        showLoading(false);

    } catch (error) {
        showError("Не удалось получить погоду");
        showLoading(false);
    }
}

function displayWeather(data) {
    document.querySelector(".city").textContent = `${data.name}, ${data.sys.country}`;

    const {
        dateString,
        timeOfDay
    } = setDate(data);
    document.querySelector(".date").textContent = dateString;

    document.querySelector(".temperature").textContent = `${Math.round(data.main.temp)}°`;
    document.querySelector(".feelsLike").textContent = `Feels like: ${Math.round(data.main.feels_like)}°`;
    document.querySelector(".conditions").textContent = data.weather[0].main;
    document.querySelector(".variation").textContent =
        `Min: ${Math.round(data.main.temp_min)}°  Max: ${Math.round(data.main.temp_max)}°`;

    const extremeCheck = checkIfExtreme(data);

    setBackground(
        data.weather[0].main,
        timeOfDay,
        data.sys.sunrise,
        data.sys.sunset,
        data.timezone,
        extremeCheck
    );
    setWeatherIcon(data.weather[0].main, timeOfDay, extremeCheck);
}

function checkIfExtreme(data) {
    const weatherId = data.weather[0].id;
    const weatherMain = data.weather[0].main;
    const temp = data.main.temp;
    const windSpeed = data.wind ? data.wind.speed : 0;
    const pressure = data.main.pressure;

    if (weatherMain === "Tornado") {
        return {
            isExtreme: true,
            type: "super",
            image: "tornado",
            reason: "Tornado Warning",
            level: "danger"
        };
    }

    if (weatherMain === "Hurricane") {
        return {
            isExtreme: true,
            type: "super",
            image: "hurricane",
            reason: "Hurricane Warning",
            level: "danger"
        };
    }

    if (weatherMain === "Sand" || weatherMain === "Dust") {
        return {
            isExtreme: true,
            type: "super",
            image: "sandstorm",
            reason: "Sand/Dust Storm",
            level: "danger"
        };
    }

    const extremeWeatherIds = [
        200, 201, 202,
        230, 231, 232,
        502, 503, 504,
        511,
        602, 621, 622,
        781,
        900,
        901, 902,
        962
    ];

    if (extremeWeatherIds.includes(weatherId)) {
        return {
            isExtreme: true,
            type: "extreme",
            image: "extreme_weather",
            reason: getReasonByWeatherId(weatherId),
            level: weatherId >= 900 ? "danger" : "warning"
        };
    }

    if (temp > 40) {
        return {
            isExtreme: true,
            type: "extreme",
            image: "extreme_weather",
            reason: "Heat Wave",
            level: temp > 45 ? "danger" : "warning"
        };
    }

    if (temp < -20) {
        return {
            isExtreme: true,
            type: "extreme",
            image: "extreme_weather",
            reason: "Extreme Cold",
            level: temp < -30 ? "danger" : "warning"
        };
    }

    if (windSpeed > 20) {
        return {
            isExtreme: true,
            type: "extreme",
            image: "extreme_weather",
            reason: "Strong Wind",
            level: windSpeed > 25 ? "danger" : "warning"
        };
    }

    if (pressure < 980) {
        return {
            isExtreme: true,
            type: "extreme",
            image: "extreme_weather",
            reason: "Storm Pressure",
            level: "warning"
        };
    }

    return {
        isExtreme: false,
        type: "normal",
        image: null,
        reason: null,
        level: null
    };
}

function getReasonByWeatherId(weatherId) {
    const reasons = {
        200: "Thunderstorm with Rain",
        201: "Heavy Thunderstorm",
        202: "Violent Thunderstorm",
        230: "Storm with Drizzle",
        231: "Storm with Heavy Drizzle",
        232: "Storm with Violent Drizzle",
        502: "Heavy Rain",
        503: "Very Heavy Rain",
        504: "Extreme Rain",
        511: "Freezing Rain",
        602: "Heavy Snow",
        621: "Shower Snow",
        622: "Heavy Shower Snow",
        781: "Tornado",
        900: "Tornado",
        901: "Tropical Storm",
        902: "Hurricane",
        962: "Violent Storm"
    };

    return reasons[weatherId] || "Extreme Weather Conditions";
}

function setBackground(weather, timeOfDay, sunrise, sunset, timezone, extremeCheck) {
    const bg = document.querySelector(".weather-bg");

    document.querySelectorAll(".snowflake, .wind-tornado, .rain-drop, .star, .lightning, .hail, .ash-particle, .sand-particle").forEach(el => el.remove());

    document.querySelectorAll(".extreme-warning").forEach(el => el.remove());

    const now = Date.now() / 1000;
    const localNow = now + timezone;
    const isDay = localNow > sunrise && localNow < sunset;


    let imageName;

    if (extremeCheck.isExtreme) {
        if (extremeCheck.type === "super") {
            imageName = `images/${extremeCheck.image}.jpg`;
        } else {
            imageName = "images/extreme_weather.jpg";
        }
    } else {
        switch (weather) {
            case "Clear":
                if (timeOfDay === "morning") imageName = "images/sunny_morning.jpg";
                else if (timeOfDay === "evening") imageName = "images/sunny_evening.jpg";
                else if (timeOfDay === "night") imageName = "images/clear_night.jpg";
                else imageName = "images/sunny_day.jpg";
                break;

            case "Clouds":
                if (timeOfDay === "morning") imageName = "images/cloudy_morning.jpg";
                else if (timeOfDay === "evening") imageName = "images/cloudy_evening.jpg";
                else if (timeOfDay === "night") imageName = "images/cloudy_night.jpg";
                else imageName = "images/cloudy_day.jpg";
                break;

            case "Rain":
            case "Drizzle":
                if (timeOfDay === "morning") imageName = "images/rain_morning.jpg";
                else if (timeOfDay === "evening") imageName = "images/rain_evening.jpg";
                else if (timeOfDay === "night") imageName = "images/rain_night.jpg";
                else imageName = "images/rain_day.jpg";
                break;

            case "Snow":
                if (timeOfDay === "morning") imageName = "images/snow_morning.jpg";
                else if (timeOfDay === "evening") imageName = "images/snow_evening.jpg";
                else if (timeOfDay === "night") imageName = "images/snow_night.jpg";
                else imageName = "images/snow_day.jpg";
                break;

            case "Thunderstorm":
                if (timeOfDay === "night") imageName = "images/thunderstorm_night.jpg";
                else imageName = "images/thunderstorm_day.jpg";
                break;

            case "Mist":
            case "Fog":
            case "Haze":
                if (timeOfDay === "night") imageName = "images/fog_night.jpg";
                else imageName = "images/fog_day.jpg";
                break;

            default:
                imageName = isDay ? "images/default_day.jpg" : "images/default_night.jpg";
        }
    }

    const img = new Image();
    img.src = imageName;

    img.onload = function() {
        bg.style.backgroundImage = `url('${imageName}')`;

        if (extremeCheck.isExtreme) {
            if (extremeCheck.type === "super") {
                bg.style.backgroundSize = "80% auto";
                bg.style.backgroundPosition = "center center";
            } else {
                bg.style.backgroundSize = "70% auto";
                bg.style.backgroundPosition = "center 30%";
            }
            bg.style.backgroundColor = "#000000";
            bg.style.backgroundRepeat = "no-repeat";
            bg.style.opacity = "0.95";

            if (extremeCheck.level === "danger") {
                bg.style.filter = "sepia(0.4) saturate(2) hue-rotate(-10deg) brightness(0.9)";
            } else {
                bg.style.filter = "sepia(0.2) saturate(1.3) brightness(0.95)";
            }
        } else {
            bg.style.backgroundSize = "cover";
            bg.style.backgroundPosition = "center";
            bg.style.backgroundColor = "transparent";
            bg.style.opacity = "0.8";
            bg.style.filter = "none";
        }
    };

    img.onerror = function() {
        bg.style.backgroundImage = getGradientByWeather(weather, timeOfDay, isDay, extremeCheck);
        bg.style.backgroundSize = "cover";
        bg.style.backgroundPosition = "center";
        bg.style.backgroundColor = "transparent";
        bg.style.opacity = "0.8";

        if (extremeCheck.isExtreme) {
            if (extremeCheck.level === "danger") {
                bg.style.filter = "sepia(0.4) saturate(2) hue-rotate(-10deg)";
            } else {
                bg.style.filter = "sepia(0.2) saturate(1.3)";
            }
        } else {
            bg.style.filter = "none";
        }
    };

    addWeatherAnimations(weather, timeOfDay, extremeCheck);

    if (extremeCheck.isExtreme) {
        showExtremeWarning(extremeCheck.reason, extremeCheck.level);
    }
}

function getGradientByWeather(weather, timeOfDay, isDay, extremeCheck) {

    if (extremeCheck.isExtreme) {
        if (extremeCheck.level === "danger") {
            return "linear-gradient(135deg, #8B0000 0%, #FF4500 50%, #FFA500 100%)";
        } else {
            return "linear-gradient(135deg, #FF8C00 0%, #FFD700 50%, #FFA500 100%)";
        }
    }

    const gradients = {
        "Clear": {
            "morning": "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)",
            "day": "linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)",
            "evening": "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)",
            "night": "linear-gradient(135deg, #0C3483 0%, #A2B6DF 100%)"
        },
        "Clouds": {
            "morning": "linear-gradient(135deg, #BDC3C7 0%, #2C3E50 100%)",
            "day": "linear-gradient(135deg, #DFE9F3 0%, #FFFFFF 100%)",
            "evening": "linear-gradient(135deg, #4B6CB7 0%, #182848 100%)",
            "night": "linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)"
        },
        "Rain": {
            "morning": "linear-gradient(135deg, #3A7BD5 0%, #00D2FF 100%)",
            "day": "linear-gradient(135deg, #4B6CB7 0%, #182848 100%)",
            "evening": "linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)",
            "night": "linear-gradient(135deg, #0F2027 0%, #203A43 100%)"
        },
        "Snow": {
            "morning": "linear-gradient(135deg, #E6DADA 0%, #274046 100%)",
            "day": "linear-gradient(135deg, #83A4D4 0%, #B6FBFF 100%)",
            "evening": "linear-gradient(135deg, #4B6CB7 0%, #182848 100%)",
            "night": "linear-gradient(135deg, #1C2E4A 0%, #2B5876 100%)"
        }
    };

    if (gradients[weather] && gradients[weather][timeOfDay]) {
        return gradients[weather][timeOfDay];
    }

    return isDay ?
        "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)" :
        "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)";
}

function setWeatherIcon(weather, timeOfDay, extremeCheck) {
    const iconElement = document.querySelector(".weather-icon");
    if (!iconElement) return;

    if (extremeCheck.isExtreme) {
        if (extremeCheck.level === "danger") {
            iconElement.textContent = "⛔";
        } else {
            iconElement.textContent = "⚠️";
        }
        return;
    }

    const icons = {
        "Clear": {
            "morning": "🌅",
            "day": "☀️",
            "evening": "🌇",
            "night": "🌙"
        },
        "Clouds": {
            "morning": "🌤️",
            "day": "⛅",
            "evening": "🌥️",
            "night": "☁️"
        },
        "Rain": {
            "morning": "🌦️",
            "day": "🌧️",
            "evening": "🌧️",
            "night": "🌧️"
        },
        "Snow": {
            "default": "❄️"
        },
        "Thunderstorm": {
            "default": "⛈️"
        },
        "Drizzle": {
            "default": "🌦️"
        },
        "Mist": {
            "default": "🌫️"
        },
        "Fog": {
            "default": "🌫️"
        }
    };

    if (icons[weather] && icons[weather][timeOfDay]) {
        iconElement.textContent = icons[weather][timeOfDay];
    } else if (icons[weather] && icons[weather]["default"]) {
        iconElement.textContent = icons[weather]["default"];
    } else {
        iconElement.textContent = timeOfDay === "night" ? "🌙" : "☀️";
    }
}

function addWeatherAnimations(weather, timeOfDay, extremeCheck) {
    document.querySelectorAll(".snowflake, .wind-tornado, .rain-drop, .star, .lightning, .hail, .ash-particle, .sand-particle").forEach(el => el.remove());

    if (extremeCheck.isExtreme) {
        addExtremeAnimations(extremeCheck);
        return;
    }

    if (weather === "Snow") {
        const flakeCount = timeOfDay === "night" ? 40 : 25;
        for (let i = 0; i < flakeCount; i++) {
            setTimeout(() => {
                const flake = document.createElement("div");
                flake.className = "snowflake";
                flake.style.left = Math.random() * 100 + "%";
                flake.style.animationDuration = (3 + Math.random() * 3) + "s";
                flake.style.animationDelay = Math.random() * 2 + "s";
                flake.style.opacity = timeOfDay === "night" ? "0.6" : "0.8";
                flake.textContent = "❄";
                document.body.appendChild(flake);
            }, i * 50);
        }
    }

    if (weather === "Rain" || weather === "Drizzle") {
        const dropCount = timeOfDay === "night" ? 30 : 20;
        for (let i = 0; i < dropCount; i++) {
            setTimeout(() => {
                const drop = document.createElement("div");
                drop.className = "rain-drop";
                drop.style.left = Math.random() * 100 + "%";
                drop.style.animationDuration = (0.5 + Math.random() * 0.7) + "s";
                drop.style.animationDelay = Math.random() * 0.5 + "s";
                drop.style.opacity = timeOfDay === "night" ? "0.3" : "0.6";
                document.body.appendChild(drop);
            }, i * 40);
        }
    }

    if (weather === "Clear" && timeOfDay === "night") {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const star = document.createElement("div");
                star.className = "star";
                star.style.left = Math.random() * 100 + "%";
                star.style.top = Math.random() * 50 + "%";
                star.style.animationDuration = (1 + Math.random() * 2) + "s";
                star.style.animationDelay = Math.random() * 1 + "s";
                star.textContent = "✨";
                document.body.appendChild(star);
            }, i * 150);
        }
    }

    if (weather === "Thunderstorm") {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const lightning = document.createElement("div");
                lightning.className = "lightning";
                lightning.style.left = Math.random() * 100 + "%";
                lightning.style.top = Math.random() * 40 + "%";
                lightning.style.animationDuration = "0.1s";
                lightning.style.animationDelay = Math.random() * 2 + "s";
                document.body.appendChild(lightning);
            }, i * 1000);
        }
    }
}

function addExtremeAnimations(extremeCheck) {

    if (extremeCheck.image === "tornado") {

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const tornado = document.createElement("div");
                tornado.className = "wind-tornado";
                tornado.style.left = Math.random() * 100 + "%";
                tornado.style.animationDuration = (2 + Math.random() * 2) + "s";
                tornado.style.animationDelay = Math.random() * 0.5 + "s";
                tornado.style.fontSize = "2rem";
                tornado.style.opacity = "0.9";
                tornado.style.zIndex = "3";
                tornado.textContent = "🌪️";
                document.body.appendChild(tornado);
            }, i * 300);
        }
    }

    if (extremeCheck.image === "hurricane") {

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const hurricane = document.createElement("div");
                hurricane.className = "wind-tornado";
                hurricane.style.left = Math.random() * 100 + "%";
                hurricane.style.animationDuration = (1.5 + Math.random() * 1.5) + "s";
                hurricane.style.animationDelay = Math.random() * 0.3 + "s";
                hurricane.style.fontSize = "1.8rem";
                hurricane.style.opacity = "0.8";
                hurricane.textContent = "🌀";
                document.body.appendChild(hurricane);
            }, i * 200);
        }
    }

    if (extremeCheck.image === "sandstorm") {

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const sand = document.createElement("div");
                sand.className = "sand-particle";
                sand.style.left = Math.random() * 100 + "%";
                sand.style.animationDuration = (2 + Math.random() * 3) + "s";
                sand.style.animationDelay = Math.random() * 1 + "s";
                sand.style.opacity = "0.7";
                sand.style.color = "#D2B48C";
                document.body.appendChild(sand);
            }, i * 50);
        }
    }

    if (extremeCheck.reason && extremeCheck.reason.includes("Thunderstorm")) {

        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const lightning = document.createElement("div");
                lightning.className = "lightning";
                lightning.style.left = Math.random() * 100 + "%";
                lightning.style.top = Math.random() * 30 + "%";
                lightning.style.animationDuration = "0.15s";
                lightning.style.animationDelay = Math.random() * 1.5 + "s";
                lightning.style.width = "4px";
                lightning.style.height = "120px";
                document.body.appendChild(lightning);
            }, i * 800);
        }
    }

    if (extremeCheck.reason && (extremeCheck.reason.includes("Rain") || extremeCheck.reason.includes("Storm"))) {

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const drop = document.createElement("div");
                drop.className = "rain-drop";
                drop.style.left = Math.random() * 100 + "%";
                drop.style.animationDuration = (0.3 + Math.random() * 0.4) + "s";
                drop.style.animationDelay = Math.random() * 0.2 + "s";
                drop.style.opacity = "0.8";
                drop.style.width = "3px";
                drop.style.height = "25px";
                document.body.appendChild(drop);
            }, i * 20);
        }
    }

    if (extremeCheck.reason && extremeCheck.reason.includes("Snow")) {

        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const flake = document.createElement("div");
                flake.className = "snowflake";
                flake.style.left = Math.random() * 100 + "%";
                flake.style.animationDuration = (2 + Math.random() * 2) + "s";
                flake.style.animationDelay = Math.random() * 1 + "s";
                flake.style.opacity = "0.9";
                flake.style.fontSize = "1.2rem";
                flake.textContent = "❄";
                document.body.appendChild(flake);
            }, i * 30);
        }
    }

    if (extremeCheck.reason && (extremeCheck.reason.includes("Wind") || extremeCheck.reason.includes("Storm"))) {

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const wind = document.createElement("div");
                wind.className = "wind-tornado";
                wind.style.left = Math.random() * 100 + "%";
                wind.style.animationDuration = (1 + Math.random() * 1) + "s";
                wind.style.animationDelay = Math.random() * 0.2 + "s";
                wind.style.fontSize = "1.3rem";
                wind.style.opacity = "0.7";
                wind.textContent = "💨";
                document.body.appendChild(wind);
            }, i * 100);
        }
    }
}

function showExtremeWarning(reason, level) {
    const warning = document.createElement("div");
    warning.className = "extreme-warning";

    const bgColor = level === "danger" ?
        "rgba(255, 50, 50, 0.95)" :
        "rgba(255, 165, 0, 0.95)";

    warning.innerHTML = `
    <div class="warning-content" style="background: ${bgColor};">
      <span class="warning-icon">${level === "danger" ? "⛔" : "⚠️"}</span>
      <span class="warning-text">${reason}</span>
    </div>
  `;

    document.body.appendChild(warning);

    setTimeout(() => {
        if (warning.parentNode) {
            warning.remove();
        }
    }, 10000);
}

function setDate(data) {
    const now = new Date();
    const localTime = new Date(now.getTime() + data.timezone * 1000);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const day = days[localTime.getUTCDay()];
    const date = localTime.getUTCDate();
    const month = months[localTime.getUTCMonth()];
    const year = localTime.getUTCFullYear();
    const hours = localTime.getUTCHours();

    let timeOfDay;
    if (hours >= 5 && hours < 10) {
        timeOfDay = "morning";
    } else if (hours >= 10 && hours < 17) {
        timeOfDay = "day";
    } else if (hours >= 17 && hours < 21) {
        timeOfDay = "evening";
    } else {
        timeOfDay = "night";
    }

    const timeString = `${hours.toString().padStart(2, '0')}:${localTime.getUTCMinutes().toString().padStart(2, '0')}`;
    const dateString = `${day} ${date} ${month} ${year}, ${timeString}`;

    return {
        dateString: dateString,
        timeOfDay: timeOfDay,
        hours: hours
    };
}

function showLoading(isLoading) {
    if (isLoading) {
        document.querySelector(".city").textContent = "Loading...";
        document.querySelector(".temperature").textContent = "...";
        document.querySelector(".weather-icon").textContent = "⏳";
    }
}

function showError(message) {
    document.querySelector(".city").textContent = "Error";
    document.querySelector(".date").textContent = message;
    document.querySelector(".temperature").textContent = "—";
    document.querySelector(".feelsLike").textContent = "—";
    document.querySelector(".conditions").textContent = "—";
    document.querySelector(".variation").textContent = "—";
    document.querySelector(".weather-icon").textContent = "❌";
}

window.addEventListener("load", () => {
    document.querySelector(".weather-bg").style.backgroundImage =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                getWeather("Moscow");
            }
        );
    } else {
        getWeather("Moscow");
    }
});