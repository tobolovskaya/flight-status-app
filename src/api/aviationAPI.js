export const fetchFlightStatus = async (flightNumber, date) => {
  try {
    const response = await fetch(
      `/api/flight?flight_iata=${encodeURIComponent(flightNumber)}`
    );

    const data = await response.json();

    if (!data || !data.data) {
      return { found: false, reason: "Немає даних від API." };
    }

    const filtered = data.data.find((f) =>
  f.flight.iata === flightNumber &&
  f.flight_date.startsWith(date)
);

    if (!filtered) {
      return {
        found: false,
        reason: `Рейс ${flightNumber} на дату ${date} не знайдено.`
      };
    }

    return {
      found: true,
      flight: {
        flightNumber: filtered.flight.iata,
        date: filtered.flight_date,
        status: filtered.flight_status || "Невідомо",
        destination: filtered.arrival?.airport || "Невідомо",
        gate: filtered.departure?.gate || "N/A"
      }
    };
  } catch (error) {
    console.error("API error:", error);
    return { found: false, reason: "Помилка при запиті до API." };
  }
};
