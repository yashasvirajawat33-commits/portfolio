
console.log("JavaScript connected");

// Select website elements
const themeButton = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");

// ------------------------------
// DARK MODE
// ------------------------------
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

// ------------------------------
// MOBILE NAVIGATION
// ------------------------------
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

// ------------------------------
// WEATHER BUTTON
// ------------------------------
if (weatherButton) {
  weatherButton.addEventListener("click", getWeather);
}

// Allow Enter to search for weather
if (cityInput) {
  cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      getWeather();
    }
  });
}

// ------------------------------
// GET WEATHER FROM VERCEL BACKEND
// ------------------------------
async function getWeather() {
  if (!cityInput || !weatherResult) return;

  const city = cityInput.value.trim();

  if (!city) {
    weatherResult.textContent = "Please enter a city.";
    return;
  }

  if (weatherButton) {
    weatherButton.disabled = true;
  }

  weatherResult.textContent = "Loading weather...";

  try {
    const response = await fetch(
      "/api/weather?city=" + encodeURIComponent(city)
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Weather request failed.");
    }

    // Display weather safely without inserting HTML strings
    weatherResult.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = data.city || city;
    weatherResult.appendChild(heading);

    if (data.country) {
      const country = document.createElement("p");
      country.textContent = "Country: " + data.country;
      weatherResult.appendChild(country);
    }

    const temperature = document.createElement("p");
    temperature.textContent =
      "Temperature: " + data.temperature + "°C";
    weatherResult.appendChild(temperature);

    if (data.feelsLike !== undefined) {
      const feelsLike = document.createElement("p");
      feelsLike.textContent =
        "Feels like: " + data.feelsLike + "°C";
      weatherResult.appendChild(feelsLike);
    }

    if (data.description) {
      const description = document.createElement("p");
      description.textContent =
        "Conditions: " + data.description;
      weatherResult.appendChild(description);
    }

    if (data.humidity !== undefined) {
      const humidity = document.createElement("p");
      humidity.textContent =
        "Humidity: " + data.humidity + "%";
      weatherResult.appendChild(humidity);
    }

    if (data.windSpeed !== undefined) {
      const wind = document.createElement("p");
      wind.textContent =
        "Wind speed: " + data.windSpeed + " m/s";
      weatherResult.appendChild(wind);
    }

  } catch (error) {
    console.error("Weather error:", error.message);
    weatherResult.textContent =
      error.message === "City not found. Please check the spelling."
        ? error.message
        : "Unable to fetch weather. Please try again.";
  } finally {
    if (weatherButton) {
      weatherButton.disabled = false;
    }
  }
}
