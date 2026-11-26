// Serverless function on Vercel: the aviationstack key stays on the server
// and never reaches the browser.
const FLIGHT_IATA = /^[A-Z0-9]{2}[0-9]{1,4}[A-Z]?$/;

export default async function handler(req, res) {
  const flight = String(req.query.flight_iata || "").trim().toUpperCase();

  if (!FLIGHT_IATA.test(flight)) {
    return res.status(400).json({ error: "Invalid flight number" });
  }

  const key = process.env.AVIATIONSTACK_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server is not configured" });
  }

  const url = new URL("https://api.aviationstack.com/v1/flights");
  url.searchParams.set("access_key", key);
  url.searchParams.set("flight_iata", flight);

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=60");
    // Pass on pagination and the provider's error code (never the key),
    // so an empty result can be told apart from a quota or plan limit.
    return res.status(upstream.ok ? 200 : 502).json({
      data: data.data ?? null,
      pagination: data.pagination ?? null,
      error: data.error ? { code: data.error.code, message: data.error.message } : null,
    });
  } catch {
    return res.status(502).json({ error: "Upstream request failed" });
  }
}
