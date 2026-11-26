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
    return res.status(upstream.ok ? 200 : 502).json({ data: data.data ?? null });
  } catch {
    return res.status(502).json({ error: "Upstream request failed" });
  }
}
