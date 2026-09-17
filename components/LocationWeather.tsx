"use client";

import { useEffect, useState } from "react";

type LocationData = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

type WeatherData = {
  temperature: number;
  weatherCode: number;
};

export default function LocationWeather() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const response = await fetch("https://ipapi.co/json/");

if (!response.ok) {
  const fallback = {
    city: "Hisar",
    country_name: "India",
    latitude: 29.1492,
    longitude: 75.7217,
  };

  const data = fallback;

  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);

  const locationData: LocationData = {
    city: data.city,
    country: data.country_name,
    latitude,
    longitude,
  };

  if (!mounted) return;

  setLocation(locationData);

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,weather_code` +
      `&timezone=auto`
  );

  if (weatherResponse.ok) {
    const weatherData = await weatherResponse.json();

    if (!mounted) return;

    setWeather({
      temperature: weatherData.current.temperature_2m,
      weatherCode: weatherData.current.weather_code,
    });
  }

  return;
}
        const data = await response.json();

        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          throw new Error("Invalid location coordinates");
        }

        const locationData: LocationData = {
          city: data.city || "Your City",
          country: data.country_name || "India",
          latitude,
          longitude,
        };

        if (!mounted) return;

        setLocation(locationData);

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,weather_code` +
            `&timezone=auto`
        );

        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();

          if (!mounted) return;

          setWeather({
            temperature: weatherData.current.temperature_2m,
            weatherCode: weatherData.current.weather_code,
          });
        }
      } catch (error) {
        console.error("LOCATION WEATHER ERROR:", error);
      }
    }

    loadData();

    function updateTime() {
      setTime(
        new Date().toLocaleTimeString("hi-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  function getWeatherText(code: number) {
    if (code === 0) return "☀️ साफ आसमान";
    if (code <= 3) return "🌤️ आंशिक बादल";
    if (code <= 48) return "🌫️ कोहरा";
    if (code <= 57) return "🌦️ बूंदाबांदी";
    if (code <= 67) return "🌧️ बारिश";
    if (code <= 77) return "❄️ बर्फ";
    if (code <= 82) return "🌦️ बारिश";
    if (code <= 86) return "🌨️ बर्फबारी";
    if (code >= 95) return "⛈️ गरज के साथ बारिश";

    return "🌤️ मौसम";
  }

  return (
    <div className="border-b bg-gray-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-5 py-2 text-sm">

        <div className="flex shrink-0 items-center gap-3">
          <span>
            📍 {location?.city || "Location"}
          </span>

          {location?.country && (
            <span className="text-gray-400">
              {location.country}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">

          {weather && (
            <>
              <span>
                {getWeatherText(weather.weatherCode)}
              </span>

              <span>
                🌡️ {Math.round(weather.temperature)}°C
              </span>
            </>
          )}

          <span>
            🕐 {time}
          </span>

        </div>

      </div>
    </div>
  );
}
