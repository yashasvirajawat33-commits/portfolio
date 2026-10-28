
module.exports = async function handler(req, res) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({
        error: "Method not allowed"
      });
    }
  
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  
    if (!apiKey) {
      return res.status(500).json({
        error: "Weather configuration is missing on the server."
      });
    }
  
    const city =
      typeof req.query.city === "string"
        ? req.query.city.trim()
        : "";
  
    if (!city || city.length > 100) {
      return res.status(400).json({
        error: "Please provide a valid city name."
      });
    }
  
    try {
      const url = new URL(
        "https://api.openweathermap.org/data/2.5/weather"
      );
  
      url.searchParams.set("q", city);
      url.searchParams.set("appid", apiKey);
      url.searchParams.set("units", "metric");
  
      const response = await fetch(url);
  
      if (!response.ok) {
        console.error(
          "Weather request failed with status:",
          response.status
        );
  
        return res.status(
          response.status === 404 ? 404 : 502
        ).json({
          error:
            response.status === 404
              ? "City not found. Please check the spelling."
              : "Unable to retrieve weather right now."
        });
      }
  
      const data = await response.json();
  
      return res.status(200).json({
        city: data.name,
        country: data.sys?.country,
        temperature: data.main?.temp,
        feelsLike: data.main?.feels_like,
        humidity: data.main?.humidity,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
        windSpeed: data.wind?.speed
      });
    } catch (error) {
      console.error("Weather API failed:", error.message);
  
      return res.status(500).json({
        error: "Something went wrong while retrieving weather."
      });
    }
  };
  