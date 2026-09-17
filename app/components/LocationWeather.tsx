"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temperature: number;
  weatherCode: number;
};

type LocationData = {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

function getWeatherText(code: number) {
  if (code === 0) return "☀️ साफ मौसम";
  if (code === 1 || code === 2) return "🌤️ आंशिक बादल";
  if (code === 3) return "☁️ बादल";
  if (code === 45 || code === 48) return "🌫️ कोहरा";
  if (code >= 51 && code <= 57) return "🌦️ बूंदाबांदी";
  if (code >= 61 && code <= 67) return "🌧️ बारिश";
  if (code >= 71 && code <= 77) return "❄️ बर्फबारी";
  if (code >= 80 && code <= 82) return "🌦️ बारिश";
  if (code >= 95 && code <= 99) return "⛈️ तूफान";

  return "🌤️ मौसम";
}

export default function LocationWeather() {
  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [time, setTime] = useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      try {
        const response = await fetch(
          "https://ipapi.co/json/"
        );

        if (!response.ok) {
          throw new Error("Location failed");
        }

        const data = await response.json();

        if (!mounted) return;

        setLocation({
          city: data.city || "Your City",
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          timezone:
            data.timezone ||
            Intl.DateTimeFormat().resolvedOptions()
              .timeZone,
        });
      } catch {
        const timezone =
          Intl.DateTimeFormat().resolvedOptions()
            .timeZone;

        if (mounted) {
          setLocation({
            city: "Your City",
            latitude: 20.5937,
            longitude: 78.9629,
            timezone,
          });
        }
      }
    }

    loadLocation();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!location) return;

    let mounted = true;

    async function loadWeather() {
      try {
if (!location) {
  return;
}
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${location.latitude}` +
          `&longitude=${location.longitude}` +
          `&current=temperature_2m,weather_code` +
          `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Weather failed");
        }

        const data = await response.json();

        if (!mounted) return;

        setWeather({
          temperature:
            data.current.temperature_2m,
          weatherCode:
            data.current.weather_code,
        });

      } catch {
        if (mounted) {
          setWeather(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      mounted = false;
    };
  }, [location]);

  useEffect(() => {
    const updateTime = () => {
      const timezone =
        location?.timezone ||
        Intl.DateTimeFormat().resolvedOptions()
          .timeZone;

      const formatted =
        new Intl.DateTimeFormat("en-IN", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());

      setTime(formatted);
    };

    updateTime();

    const interval = setInterval(
      updateTime,
      1000
    );

    return () => clearInterval(interval);
  }, [location]);

  if (loading) {
    return (
      <div className="border-b bg-gray-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-2 text-xs">
          मौसम और local time load हो रहा है...
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-gray-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-5 py-2 text-xs sm:text-sm">

        <div className="flex min-w-max items-center gap-4">

          <span>
            📍 {location?.city || "Your City"}
          </span>

          {weather && (
            <span>
              {getWeatherText(
                weather.weatherCode
              )}
            </span>
          )}

          {weather && (
            <span>
              🌡️ {Math.round(weather.temperature)}°C
            </span>
          )}

        </div>

        <div className="min-w-max">
          🕐 {time}
        </div>

      </div>
    </div>
  );
}
