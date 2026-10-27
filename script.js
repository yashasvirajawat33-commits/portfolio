console.log("JavaScript connected");

const themeButton = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");

if (themeButton) {
  themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      themeButton.textContent = "Switch to Light Mode";
    } else {
      themeButton.textContent = "Switch to Dark Mode";
    }
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", function () {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "Close" : "Menu";
  });

  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
    });
  });
}

if (weatherButton) {
  weatherButton.addEventListener("click", getWeather);
}

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherResult.textContent = "Please enter a city.";
    return;
  }

  weatherResult.textContent = "Loading weather...";

  try {
    const geoResponse = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(city) +
        "&count=1"
    );

    if (!geoResponse.ok) {
      throw new Error("HTTP " + geoResponse.status);
    }

    const geoData = await geoResponse.json();
    const place = geoData.results && geoData.results[0];

    if (!place) {
      weatherResult.textContent = "City not found. Please try another name.";
      return;
    }

    const weatherResponse = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        place.latitude +
        "&longitude=" +
        place.longitude +
        "&current_weather=true"
    );

    if (!weatherResponse.ok) {
      throw new Error("HTTP " + weatherResponse.status);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather;

    weatherResult.innerHTML =
      "<h3>" +
      place.name +
      "</h3>" +
      "<p>Temperature: " +
      current.temperature +
      "°C</p>" +
      "<p>Wind speed: " +
      current.windspeed +
      " km/h</p>";
  } catch (error) {
    weatherResult.textContent =
      "Unable to fetch weather. Please try again.";
    console.error(error);
  }
}
